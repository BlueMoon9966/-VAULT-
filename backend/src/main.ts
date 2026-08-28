import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import contentRouter from './routes/content';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
app.use(bodyParser.json());

// CORS (allow credentials for cookies)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

app.use('/api/auth', authRouter(prisma));
app.use('/api/content', contentRouter(prisma));

app.get('/', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API running on', port));
