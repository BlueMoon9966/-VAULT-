import { Router } from 'express';

export default function contentRouter(prisma) {
  const router = Router();

  // simple endpoint: load VAULT from repo path (vault=A) -> read from filesystem
  router.get('/vault', async (req, res) => {
    // For security, only allow reading bundled VAULT file
    const fs = require('fs');
    const path = require('path');
    const vaultPath = path.resolve(__dirname, '../../../VAULT');
    if (!fs.existsSync(vaultPath)) return res.status(404).json({ error: 'VAULT not found' });
    const raw = fs.readFileSync(vaultPath, 'utf-8');
    try {
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ error: 'Invalid VAULT format' });
    }
  });

  // simple search: traverse cached index
  router.get('/search', async (req, res) => {
    const q = (req.query.q || '').toString().toLowerCase();
    if (!q) return res.json({ results: [] });
    const cache = await prisma.vaultCache.findFirst();
    const idx = (cache && cache.index) || [];
    const results = idx.filter(item => (item.name && item.name.toLowerCase().includes(q)) || (item.author && item.author.toLowerCase().includes(q)));
    res.json({ results });
  });

  return router;
}
