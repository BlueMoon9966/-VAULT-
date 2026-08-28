import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default function authRouter(prisma) {
  const router = Router();

  // Register
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (exists) return res.status(409).json({ error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, email, password: hash } });
    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  });

  // Login -> set refresh cookie + return access token
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing' });
    const user = await prisma.user.findFirst({ where: { OR: [{ username }, { email: username }] } });
    if (!user) return res.status(401).json({ error: 'Invalid' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid' });

    if (user.suspended) return res.status(403).json({ error: 'Account suspended' });
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) return res.status(403).json({ error: 'Account expired' });

    const access = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET || 'change', { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || 'change', { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' });

    // Store hashed refresh token in DB
    const hash = await bcrypt.hash(refresh, 10);
    await prisma.refreshToken.create({ data: { tokenHash: hash, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) } });

    // Set httpOnly cookie (token=A flow)
    res.cookie('refreshToken', refresh, { httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
    res.json({ accessToken: access, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  });

  // Refresh
  router.post('/refresh', async (req, res) => {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'change');
      const userId = payload.sub;
      // find token in DB by matching hash
      const tokens = await prisma.refreshToken.findMany({ where: { userId, revoked: false } });
      const ok = await Promise.any(tokens.map(async (t) => {
        const match = await bcrypt.compare(token, t.tokenHash);
        return match ? t : Promise.reject(false);
      })).catch(() => null);
      if (!ok) return res.status(401).json({ error: 'Invalid token' });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(401).json({ error: 'No user' });
      const access = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET || 'change', { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
      res.json({ accessToken: access });
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Logout
  router.post('/logout', async (req, res) => {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      // revoke tokens by matching hash
      const tokens = await prisma.refreshToken.findMany({ where: { revoked: false } });
      for (const t of tokens) {
        const match = await bcrypt.compare(token, t.tokenHash).catch(() => false);
        if (match) {
          await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });
        }
      }
    }
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  });

  return router;
}
