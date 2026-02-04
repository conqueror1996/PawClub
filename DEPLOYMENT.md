# PawPal Deployment Guide

## 1. Frontend (pawpal_client)
Deploy to **Vercel**:
1. Go to Vercel.com and "Add New Project".
2. Import from your GitHub repository `PawClub`.
3. Select the `pawpal_client` directory as the Root Directory.
4. **Build Command**: `next build` (default).
5. **Install Command**: `npm install` (default).
6. **Environment Variables**: None needed for pure frontend unless you hardcoded `localhost:3000`.
   - *Note*: You MUST update the `fetch` calls in `pawpal_client` to point to your deployed backend URL instead of `localhost:3000`. You can use an environment variable like `NEXT_PUBLIC_API_URL`.

## 2. Backend (pawpal_backend)
Deploy to **Render.com** (recommended for Node/Express):
1. Create a "Web Service" on Render.
2. Connect GitHub repo `PawClub`.
3. Root Directory: `pawpal_backend`.
4. **Build Command**: `npm install && npm run build`.
5. **Start Command**: `npm start`.
6. **Database**:
   - The current app uses **SQLite** (`dev.db`).
   - On Render Free Tier, the filesystem is ephemeral. **Your data will likely vanish on restart.**
   - **Solution**: Use a Render **Disk** (requires paid tier) OR switch to a cloud database like **Neon (Postgres)** or **Supabase**.

## 3. Switching to PostgreSQL (Recommended for Production)
If you want persistent data on a free tier deployment:
1. Create a free Postgres database on [Neon.tech](https://neon.tech).
2. Get the connection string (e.g., `postgresql://user:pass@...`).
3. Update `pawpal_backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Set `DATABASE_URL` in your Render Environment Variables.
5. Update `pawpal_backend/db_service.ts` to remove the `better-sqlite3` adapter and just use standard `new PrismaClient()`.
6. Run `npx prisma migrate deploy` in your build command.

## 4. Final Polish
- Create a `.env` file in Frontend to handle the API URL.
- Update `cors` in `server.ts` to allow your Vercel frontend URL.
