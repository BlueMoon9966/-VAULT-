# VAULT App Scaffold

This branch contains a minimal scaffold for a Vault browser app using:
- Backend: Express + Prisma (Node/TypeScript) (lightweight rather than full Nest for prototype)
- Frontend: Next.js + hls.js
- DB: Postgres (docker-compose)

What I added:
- docker-compose.yml
- backend/ with Prisma schema + simple auth routes (JWT access + refresh cookie)
- frontend/ with Next.js pages (login, player)

Next steps:
- Run docker compose up for db & redis
- Install backend deps and run prisma migrate & seed
- Start backend and frontend

I'll follow up by adding more endpoints (vault parser that flattens tree into vault_cache), admin UI, and route protection.
