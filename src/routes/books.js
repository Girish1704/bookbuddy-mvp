const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// List books for the current user
router.get('/', requireAuth, async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            where: { userId: req.user.id }
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new book
router.post('/', requireAuth, async (req, res) => {
    const { title, author } = req.body;
    try {
        const book = await prisma.book.create({
            data: {
                title,
                author,
                userId: req.user.id
            }
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ error: 'Bad request' });
    }
});

// Update a book
router.put('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { title, author } = req.body;

    try {
        const book = await prisma.book.findUnique({ where: { id: Number(id) } });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updatedBook = await prisma.book.update({
            where: { id: Number(id) },
            data: { title, author }
        });
        res.json(updatedBook);
    } catch (error) {
        res.status(400).json({ error: 'Bad request' });
    }
});

// Delete a book
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const book = await prisma.book.findUnique({ where: { id: Number(id) } });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.book.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


// === Exercise 02 Task 1: Copilot inline suggestion practice ===
// TODO: Write a function sanitizeInput(str) that trims whitespace, removes script tags, and limits length to 100 chars
// TODO: Implement function suggestBooksForUser(userId) that queries books and reviews to recommend similar titles
// Sanitize input function
function sanitizeInput(str) {
    const trimmed = str.trim();
    const sanitized = trimmed.replace(/<script.*?>.*?<\/script>/gi, '');
    return sanitized.substring(0, 100);
}

// Suggest books for user function
async function suggestBooksForUser(userId) {
    try {
        const books = await prisma.book.findMany({
            where: { userId },
            include: { reviews: true } // Assuming there's a reviews relation
        });
        // Logic to recommend similar titles based on books and reviews
        // This is a placeholder for the recommendation logic
        return books; // Modify this to return recommended titles
    } catch (error) {
        throw new Error('Error fetching suggestions');
    }
}