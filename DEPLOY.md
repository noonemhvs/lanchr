Deploying static front-end to GitHub Pages

This repository contains a static front-end (`index.html` + assets) and a Node backend (`server.js`). GitHub Pages can only serve static sites. To publish the front-end to `noonemhvs.github.io/lanchr`:

1. Ensure `index.html` and all assets are at the repository root (they are in this repo).
2. Commit and push `main` to GitHub.
3. The included GitHub Actions workflow `.github/workflows/pages.yml` will automatically publish the repository root to GitHub Pages on push to `main`.

Important: Chat and auth require the Node backend. For full functionality, deploy the backend to a hosting provider (Render, Railway, Fly, Vercel Serverless) and set `API_BASE`/`SOCKET_URL` in the client to point to the backend. Also ensure CORS and cookie settings (`sameSite: 'none'`, `secure: true`) are configured on the backend.

If you want, I can prepare the backend for deployment (env vars, Dockerfile, or Render/Railway guide).