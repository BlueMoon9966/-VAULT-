import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Bad auth' });
  const token = parts[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'change');
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function adminMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Bad auth' });
  const token = parts[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'change');
    if (!payload || payload.role !== 'admin') return res.status(403).json({ error: 'Admin role required' });
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
