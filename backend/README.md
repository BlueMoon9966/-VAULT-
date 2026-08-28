เพิ่มบริการ parser ที่ traverse ไฟล์ VAULT และสร้าง flat index (VaultCache.index) รวมทั้ง endpoints ใหม่

- POST /api/content/import  -> parse VAULT and save index to DB
- GET  /api/content/index   -> return cached flat index
- GET  /api/content/vault   -> returns raw VAULT file
- GET  /api/content/search?q=... -> search cached index

วิธีใช้งานแบบสรุป:
1) ขึ้น db & redis ด้วย docker compose
2) ติดตั้ง backend deps และรัน prisma migrate/seed
3) เรียก POST http://localhost:4000/api/content/import เพื่อนำเข้า VAULT ไปเก็บเป็น index
4) GET http://localhost:4000/api/content/index เพื่อตรวจผล
