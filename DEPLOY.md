# Deployment Guide

## Frontend (GitHub Pages) - Automatic ✅

The frontend automatically deploys to GitHub Pages on every push to `main` via GitHub Actions workflow (`.github/workflows/pages.yml`).

**Live URL:** https://noonemhvs.github.io/lanchr

---

## Backend Deployment to Render

### Quick Setup (Recommended)

1. **Sign up to Render**
   - Go to https://render.com
   - Click "Sign up with GitHub"
   - Authorize the app

2. **Deploy Backend**
   - Click **"New +"** → **"Web Service"**
   - Select the `noonemhvs/lanchr` repository
   - Render will auto-detect `render.yaml` and deploy
   - Wait ~2-3 minutes for deployment to complete

3. **Get Backend URL**
   - Go to Dashboard → Your service
   - Copy the URL (e.g., `https://lanchr-backend-xxxxx.onrender.com`)

4. **Update Frontend**
   - Open `index.html`
   - Find line ~3: `const API_BASE_URL = isGitHubPages ? '...'`
   - Replace the Render URL with your actual URL:
   ```javascript
   const API_BASE_URL = isGitHubPages 
       ? 'https://lanchr-backend-xxxxx.onrender.com'
       : 'http://localhost:3000';
   ```

5. **Commit & Push**
   ```bash
   git add index.html
   git commit -m "Update backend URL to Render deployment"
   git push origin main
   ```

GitHub Pages will update automatically within 1 minute.

---

## Local Testing

Run the backend locally to test before deployment:

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser.

**Test Credentials:**
- Register a new account or use any username/password
- Accounts are stored in `./data/db.sqlite`

---

## Architecture

```
┌─────────────────────────────────────┐
│  GitHub Pages (Static Frontend)     │
│  https://noonemhvs.github.io/lanchr │
└────────────────┬────────────────────┘
                 │ HTTPS Requests
                 ↓
┌─────────────────────────────────────┐
│  Render Backend (Express + Socket.IO)│
│  https://lanchr-backend-xxxxx...    │
├─────────────────────────────────────┤
│ • JWT Authentication (httpOnly)     │
│ • SQLite Database                   │
│ • WebSocket Chat (Socket.IO)        │
└─────────────────────────────────────┘
```

---

## Features

- ✅ **Authentication** - Register/Login with JWT tokens
- ✅ **Chat** - Real-time messaging via Socket.IO
- ✅ **Server List** - Browse Eaglercraft servers
- ✅ **File Injection** - Inject mods into clients
- ✅ **Settings** - Theme customization
- ✅ **CORS** - Cross-origin requests from GitHub Pages

---

## Troubleshooting

### "Backend is not available" error
**Solution:** 
- Check backend URL in `index.html` is correct
- Wait 2-3 minutes after Render deployment completes
- Verify Render service is running (green status)

### Login/Register returns 5xx error
**Solution:**
- Check Render logs: Dashboard → Service → Logs
- Verify `JWT_SECRET` is set (auto-generated)
- Restart service if needed

### Chat not connecting
**Solution:**
- Check WebSocket connection in DevTools (Network tab)
- Verify backend is running
- Check CORS headers are being sent

### Cookies not working
**Solution:**
- Backend sets `sameSite: 'none', secure: true`
- Frontend sends `credentials: 'include'` in fetch
- Only works over HTTPS (GitHub Pages is HTTPS)

---

## Notes

- **Render Free Tier:** Service sleeps after 15 min inactivity (first request takes ~30s to wake)
- **Database:** SQLite stores users and messages in `/opt/render/project/data/db.sqlite`
- **Cold Starts:** Allow 30-60 seconds on first request after sleep
- **Scaling:** Upgrade to paid plan to remove sleep and get better performance
