# Backend (Nest-based) scaffold

Commands

- Start dev (local, requires Docker services up):
  - docker compose up -d db redis
  - cd backend && npm install
  - npm run start:dev

- Run migrations
  - npx prisma migrate dev --name init
  - node prisma/seed.js (or npm run prisma:seed)


This scaffold contains a minimal Nest-style server with auth + vault parser placeholders.
