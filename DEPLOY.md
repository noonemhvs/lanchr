# Deployment Guide

## Frontend (GitHub Pages) - Automatic ✅

The frontend automatically deploys to GitHub Pages on every push to `main` via GitHub Actions workflow (`.github/workflows/pages.yml`).

**Live URL:** https://noonemhvs.github.io/lanchr

---

## Backend Deployment to Fly.io ⭐ RECOMMENDED

### Setup (First Time Only)

1. **Install flyctl**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
   Or download from: https://fly.io/docs/hands-on/install-flyctl/

2. **Login to Fly.io**
   ```bash
   flyctl auth login
   ```
   This opens your browser to create a free account (GitHub signup works)

### Deploy Backend

```bash
cd /workspaces/lanchr
flyctl deploy
```

Wait 1-2 minutes for deployment to complete.

### Get Your Backend URL

After deployment:
```bash
flyctl info --json | jq -r '.appUrl'
```

Or check Fly.io dashboard: https://fly.io/dashboard

It will be: `https://lanchr-backend-xxxxx.fly.dev`

### Update Frontend with Backend URL

1. Edit `index.html` (line ~3)
2. Replace:
```javascript
const API_BASE_URL = isGitHubPages 
    ? 'https://supreme-system-69w94pg7g6v2rvj7-3000.preview.app.github.dev'
    : 'http://localhost:3000';
```

With your Fly.io URL:
```javascript
const API_BASE_URL = isGitHubPages 
    ? 'https://lanchr-backend-xxxxx.fly.dev'  // ← Your Fly.io URL
    : 'http://localhost:3000';
```

3. Push:
```bash
git add index.html
git commit -m "Update backend URL to Fly.io deployment"
git push origin main
```

GitHub Pages auto-updates in ~1 minute. ✅

---

## Local Testing

```bash
npm install
npm start
```

Then open `http://localhost:3000`

---

## Features

- ✅ Authentication (JWT + httpOnly cookies)
- ✅ Real-time Chat (Socket.IO)
- ✅ Server List
- ✅ File Injection
- ✅ Settings & Themes
- ✅ CORS for GitHub Pages

---

## Troubleshooting

**Backend not available:**
- Check `API_BASE_URL` in index.html
- Verify Fly.io app running: `flyctl status`
- Wait 2-3 minutes after deploy

**Login errors:**
- Check logs: `flyctl logs`
- Verify secrets: `flyctl secrets list`
- Restart: `flyctl restart`

**Chat not connecting:**
- Check WebSocket in DevTools
- Verify backend is running
- Check CORS headers: `flyctl logs`

---

## Fly.io Commands

```bash
flyctl status          # Check status
flyctl logs            # View logs
flyctl secrets list    # View environment variables
flyctl restart         # Restart app
flyctl ssh console     # Connect to container
```

Dashboard: https://fly.io/dashboard

---

## Notes

- No cold starts (always running)
- Data persists automatically
- HTTPS included
- Free tier includes 3 apps + 3GB storage
- Recommended over Render
