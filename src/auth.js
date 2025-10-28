const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function register(email, password) {
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const user = await prisma.user.create({ data: { email, passwordHash: hash } });
return { id: user.id, email: user.email };
}

async function login(email, password) {
const user = await prisma.user.findUnique({ where: { email } });
if (!user) throw new Error('Invalid credentials');
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) throw new Error('Invalid credentials');
const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
return token;
}

function requireAuth(req, res, next) {
const auth = req.headers.authorization;
if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
const token = auth.slice(7);
try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
} catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
}
}

module.exports = { register, login, requireAuth };
async function getUserById(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return { id: user.id, email: user.email };
}