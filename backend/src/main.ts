import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import contentRouter from './routes/content';

const app = express();
const prisma = new PrismaClient();
app.use(bodyParser.json());

app.use('/api/auth', authRouter(prisma));
app.use('/api/content', contentRouter(prisma));

app.get('/', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API running on', port));
