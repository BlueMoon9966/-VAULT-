// simple auth middleware to protect routes (checks Authorization Bearer access token)
import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Bad auth' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'change');
    req.user = payload;
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid token' }); }
}
