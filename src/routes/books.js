const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireAuth } = require('../auth');

// List books for the current user
router.get('/', requireAuth, async (req, res) => {
try {
    const books = await prisma.book.findMany({
    where: { userId: req.userId }
    });
    res.json(books);
} catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
}
});

// Create a new book
router.post('/', requireAuth, async (req, res) => {
const { title, author } = req.body;
if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
}
try {
    const book = await prisma.book.create({
    data: { title, author, userId: req.userId }
    });
    res.status(201).json(book);
} catch (err) {
    res.status(500).json({ error: 'Failed to create book' });
}
});

// Update a book (owner-only)
router.put('/:id', requireAuth, async (req, res) => {
const bookId = parseInt(req.params.id, 10);
const { title, author } = req.body;
try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.book.update({
    where: { id: bookId },
    data: { title, author }
    });
    res.json(updated);
} catch (err) {
    res.status(500).json({ error: 'Failed to update book' });
}
});

// Delete a book (owner-only)
router.delete('/:id', requireAuth, async (req, res) => {
const bookId = parseInt(req.params.id, 10);
try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.book.delete({ where: { id: bookId } });
    res.json({ success: true });
} catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
}
});

module.exports = router;

// === Extra functions ===

// Sanitize user input
function sanitizeInput(str) {
return str.trim().replace(/<script.*?>.*?<\/script>/gi, '').slice(0, 100);
}

// Suggest books for a user based on authors
async function suggestBooksForUser(userId) {
try {
    const userBooks = await prisma.book.findMany({ where: { userId } });
    const authors = userBooks.map(book => book.author);
    const recommended = await prisma.book.findMany({
    where: {
        author: { in: authors },
        NOT: { userId }
    }
    });
    return recommended;
} catch (err) {
    console.error('Failed to suggest books:', err);
    return [];
}
}