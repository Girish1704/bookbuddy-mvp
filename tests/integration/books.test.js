// 1️⃣ Set JWT_SECRET before importing modules
process.env.JWT_SECRET = 'test-secret-key';

// 2️⃣ Mock authentication middleware BEFORE importing router
jest.mock('../../src/auth', () => ({
requireAuth: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
}
}));

// 3️⃣ Mock Prisma client directly inside factory
jest.mock('@prisma/client', () => {
const mPrisma = {
    book: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    }
};
return { PrismaClient: jest.fn(() => mPrisma) };
});

// 4️⃣ Import dependencies AFTER mocks
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const request = require('supertest');
const express = require('express');
const booksRouter = require('../../src/routes/books');

const app = express();
app.use(express.json());
app.use('/books', booksRouter);

describe('Book CRUD Endpoints', () => {
beforeEach(() => {
    jest.clearAllMocks(); // reset mocks before each test
});

it('should list books for the current user', async () => {
    prisma.book.findMany.mockResolvedValue([{ id: '1', title: 'Book 1', userId: 'test-user-id' }]);
    const res = await request(app)
    .get('/books')
    .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: '1', title: 'Book 1', userId: 'test-user-id' }]);
});

it('should create a new book', async () => {
    prisma.book.create.mockResolvedValue({ id: '2', title: 'Test Book', author: 'Test Author', userId: 'test-user-id' });
    const res = await request(app)
    .post('/books')
    .send({ title: 'Test Book', author: 'Test Author' })
    .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', '2');
});

it('should update a book (owner-only)', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: '1', userId: 'test-user-id' });
    prisma.book.update.mockResolvedValue({ id: '1', title: 'Updated Title', author: 'Updated Author', userId: 'test-user-id' });

    const res = await request(app)
    .put('/books/1')
    .send({ title: 'Updated Title', author: 'Updated Author' })
    .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
});

it('should delete a book (owner-only)', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: '1', userId: 'test-user-id' });
    prisma.book.delete.mockResolvedValue({ id: '1' });

    const res = await request(app)
    .delete('/books/1')
    .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
});

it('should return 403 when updating/deleting a book not owned by user', async () => {
    prisma.book.findUnique.mockResolvedValue({ id: '2', userId: 'other-user-id' });

    const res = await request(app)
    .put('/books/2')
    .send({ title: 'Should Fail', author: 'Should Fail' })
    .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(403);
});

it('should return 404 when updating/deleting a non-existent book', async () => {
    prisma.book.findUnique.mockResolvedValue(null);

    const res = await request(app)
    .delete('/books/999')
    .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(404);
});
});