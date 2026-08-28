import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseAndIndex } from '../services/vaultParser';
import { adminMiddleware } from '../middlewares/authMiddleware';

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

  // POST /api/content/import -> parse VAULT and create/update vault_cache (admin-only)
  router.post('/import', adminMiddleware, async (req, res) => {
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

  // GET /api/content/list?category=...&year=...
  router.get('/list', async (req, res) => {
    const category = req.query.category ? String(req.query.category).toLowerCase() : null;
    const year = req.query.year ? String(req.query.year) : null;
    const cache = await prisma.vaultCache.findFirst();
    const idx = (cache && cache.index) || [];
    let results = idx;
    if (category) {
      results = results.filter((item: any) => (item.path || '').toLowerCase().includes(category));
    }
    if (year) {
      results = results.filter((item: any) => {
        return (item.name && item.name.includes(year)) || ((item.path || '').includes(year));
      });
    }
    res.json({ count: results.length, results });
  });

  // GET /api/content/item?path=... (exact match)
  router.get('/item', async (req, res) => {
    const p = req.query.path ? String(req.query.path) : null;
    if (!p) return res.status(400).json({ error: 'path query required' });
    const cache = await prisma.vaultCache.findFirst();
    const idx = (cache && cache.index) || [];
    const found = idx.find((item: any) => item.path === p || decodeURIComponent(item.path || '') === p || item.path === decodeURIComponent(p));
    if (!found) return res.status(404).json({ error: 'Not found' });
    res.json({ item: found });
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
