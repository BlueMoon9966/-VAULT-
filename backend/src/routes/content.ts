import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseAndIndex } from '../services/vaultParser';

export default function contentRouter(prisma: PrismaClient) {
  const router = Router();

  // GET /api/content/vault -> return raw VAULT (bundled file)
  router.get('/vault', async (req, res) => {
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

  // POST /api/content/import -> parse VAULT and create/update vault_cache
  router.post('/import', async (req, res) => {
    try {
      const result = await parseAndIndex(prisma);
      res.json({ ok: true, count: result.count });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/content/index -> return cached flat index (if any)
  router.get('/index', async (req, res) => {
    const cache = await prisma.vaultCache.findFirst();
    const idx = (cache && cache.index) || [];
    res.json({ count: idx.length, index: idx });
  });

  // simple search: search in cached index
  router.get('/search', async (req, res) => {
    const q = (req.query.q || '').toString().toLowerCase();
    if (!q) return res.json({ results: [] });
    const cache = await prisma.vaultCache.findFirst();
    const idx = (cache && cache.index) || [];
    const results = idx.filter((item: any) => {
      return (item.name && item.name.toLowerCase().includes(q)) || (item.author && item.author.toLowerCase().includes(q));
    });
    res.json({ results });
  });

  return router;
}
