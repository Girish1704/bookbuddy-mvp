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