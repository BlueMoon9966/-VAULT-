import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

type VaultNode = any;

function isLeaf(node: VaultNode) {
  // Consider a leaf any node that has a url (points to content) or has no groups array
  return (!!node.url) || !Array.isArray(node.groups) || (Array.isArray(node.groups) && node.groups.length === 0);
}

function collectLeaves(node: VaultNode, parents: string[] = [], out: any[] = []) {
  const name = node.name || node.title || '';
  const curPath = parents.slice();
  if (name) curPath.push(name);

  if (isLeaf(node)) {
    const item = {
      name: name || null,
      author: node.author || null,
      image: node.image || null,
      url: node.url || null,
      import: node.import === false ? false : true,
      path: curPath.join('/')
    };
    out.push(item);
  }

  if (Array.isArray(node.groups)) {
    for (const g of node.groups) {
      collectLeaves(g, curPath, out);
    }
  }
  return out;
}

export async function parseAndIndex(prisma: PrismaClient) {
  const vaultPath = path.resolve(__dirname, '../../..', 'VAULT');
  if (!fs.existsSync(vaultPath)) throw new Error('VAULT file not found at ' + vaultPath);
  const raw = fs.readFileSync(vaultPath, 'utf-8');
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error('Invalid VAULT JSON: ' + e.message);
  }

  const index: any[] = [];
  // root may contain groups
  if (Array.isArray(parsed.groups)) {
    for (const g of parsed.groups) {
      collectLeaves(g, [parsed.name || 'ROOT', g.name || ''], index);
    }
  } else {
    // if top-level is itself a list
    collectLeaves(parsed, [parsed.name || 'ROOT'], index);
  }

  // upsert into VaultCache by source = 'VAULT'
  const existing = await prisma.vaultCache.findFirst({ where: { source: 'VAULT' } });
  if (existing) {
    await prisma.vaultCache.update({ where: { id: existing.id }, data: { raw: parsed, index } });
  } else {
    await prisma.vaultCache.create({ data: { source: 'VAULT', raw: parsed, index } });
  }

  return { count: index.length, index };
}
