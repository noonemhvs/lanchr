require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow GitHub Pages, localhost, and any origin during development
      if (!origin || origin.includes('localhost') || origin.includes('github.io') || origin.includes('codespace')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for now, restrict later
      }
    },
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_replace_me';
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.sqlite');

// Ensure data dir
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Init DB
const db = new sqlite3.Database(DB_FILE);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS: Allow GitHub Pages and localhost
const allowedOrigins = [
  'https://noonemhvs.github.io',
  'http://localhost:3000',
  'http://localhost:5000',
  'file://'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Helpers
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: process.env.SESSION_TTL || '1d' });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1] || req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  const now = Date.now();
  db.run('INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)', [username, hashed, now], function (err) {
    if (err) return res.status(400).json({ error: 'User exists or DB error' });
    const user = { id: this.lastID, username };
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ user, token });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  db.get('SELECT id, username, password FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, username: row.username };
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ user, token });
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/messages', (req, res) => {
  db.all('SELECT id, username, text, created_at FROM messages ORDER BY id ASC LIMIT 200', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Socket.io chat
io.use((socket, next) => {
  let token = socket.handshake.auth && socket.handshake.auth.token;
  // fallback: try cookie header (token cookie set by HTTP login)
  if (!token && socket.handshake.headers && socket.handshake.headers.cookie) {
    const m = socket.handshake.headers.cookie.match(/(?:^|; )token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = payload;
  } catch (e) { }
  next();
});

io.on('connection', (socket) => {
  const user = socket.user || { id: null, username: 'Guest' };
  console.log('socket connected', user.username);

  socket.on('message', (msg) => {
    const text = String(msg).slice(0, 1000);
    const now = Date.now();
    db.run('INSERT INTO messages (user_id, username, text, created_at) VALUES (?, ?, ?, ?)', [user.id, user.username, text, now], function (err) {
      if (err) return;
      const message = { id: this.lastID, user_id: user.id, username: user.username, text, created_at: now };
      io.emit('message', message);
    });
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', user.username);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
