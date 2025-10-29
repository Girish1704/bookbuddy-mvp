require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Routes
app.get('/', (req, res) => {
res.send('BookBuddy API is running ✅');
});

app.get('/health', (req, res) => {
res.send('OK');
});

// === Exercise 02 Task 2: Contextual Awareness ===
const { requireAuth } = require('./auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
datasources: {
    db: { url: process.env.DATABASE_URL }
}
});

app.get('/me', requireAuth, async (req, res) => {
if (!req.userId || typeof req.userId !== 'number') {
    return res.status(400).json({ error: 'Invalid user ID' });
}

try {
    const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
} catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
}
});

// Start server
app.listen(PORT, () => {
console.log(`✅ Server running on http://localhost:${PORT}`);
});