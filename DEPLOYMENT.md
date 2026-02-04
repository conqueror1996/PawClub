# PawPal Deployment Guide (Ready for Launch 🚀)

## ✅ Status Check
- **Codebase**: Pushed to GitHub (`main` branch).
- **BackendDB**: Migrated to PostgreSQL (Required).
- **Builds**: Verified passing locally.

---

## 1. Backend Deployment (Render.com)
1. Creates a **New Web Service** on Render.
2. Connect your GitHub repository: `PawClub`.
3. **Settings**:
   - **Root Directory**: `pawpal_backend`
   - **Build Command**: `npm install && npm run build:render`
   - **Start Command**: `npm start`
4. **Environment Variables** (CRITICAL):
   - `DATABASE_URL`: Add your PostgreSQL connection string here (e.g., from Neon.tech).
   - `GEMINI_API_KEY`: If you are using Gemini, ensure this is added too.

> **Note**: The backend will NOT start without a valid `DATABASE_URL`.

---

## 2. Frontend Deployment (Vercel)
1. Create a **New Project** on Vercel.
2. Import the `PawClub` repository.
3. **Settings**:
   - **Root Directory**: Select `pawpal_client` (Edit).
   - **Framework Preset**: Next.js (Auto-detected).
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed Render backend (e.g., `https://pawpal-backend.onrender.com`).
     - *Important*: Do NOT include a trailing slash `/`.

---

## 3. Final Verification
- Open your Vercel URL.
- Try to "Ask AI".
- If it works, your full stack is live! 
