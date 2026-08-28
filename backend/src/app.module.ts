import { PrismaClient } from '@prisma/client';
import express from 'express';

export function createApp(prisma: PrismaClient) {
  const app = express();
  app.use(express.json());
  return app;
}
