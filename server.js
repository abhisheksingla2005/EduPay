require('dotenv').config();
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// HTTPS setup: use SSL if cert/key paths provided, otherwise HTTP
let server;
const useHTTPS = process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH;
if (useHTTPS) {
  try {
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    server = https.createServer(sslOptions, app);
    console.log('[SSL] HTTPS enabled');
  } catch (err) {
    console.error('[SSL] Failed to load certificates, falling back to HTTP:', err.message);
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
  console.log('[SSL] Using HTTP (set SSL_KEY_PATH and SSL_CERT_PATH for HTTPS)');
}

const { Server } = require('socket.io');
const io = new Server(server);
// Redis setup (only attempt if REDIS_URL explicitly set)
let redisClient = null;
if (process.env.REDIS_URL) {
  const { initRedis } = require('./config/redis');
  initRedis()
    .then((client) => { redisClient = client; app.locals.redis = client; })
    .catch(() => { console.warn('[Redis] proceeding without cache'); });
} else {
  console.log('[Redis] Skipped initialization (REDIS_URL not provided)');
}

// Attach io to app for access in controllers
app.set('io', io);

// Socket.io basic role-based rooms
io.on('connection', (socket) => {
  socket.on('join-role', (role) => {
    if (typeof role === 'string') {
      const room = role.toLowerCase() + 's';
      socket.join(room);
    }
  });
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Attach user to locals if any (from JWT cookie)
const { attachUserIfExists } = require('./middleware/auth');
app.use(attachUserIfExists);
// Ensure EJS always has a defined currentUser variable
app.use((req, res, next) => {
  if (typeof res.locals.currentUser === 'undefined') {
    res.locals.currentUser = null;
  }
  // Default flash-like locals to avoid ReferenceError in templates
  if (typeof res.locals.error === 'undefined') {
    res.locals.error = null;
  }
  if (typeof res.locals.message === 'undefined') {
    res.locals.message = null;
  }
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/student', require('./routes/student'));
app.use('/donor', require('./routes/donor'));
app.use('/admin', require('./routes/admin'));

// 404 and error handling
app.use(notFound);
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 8080;
(async () => {
  try {
    await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/edupay');
    server.listen(PORT, () => {
      const protocol = useHTTPS ? 'https' : 'http';
      console.log(`EduPay running at ${protocol}://localhost:${PORT}`);
      if (redisClient) console.log('[Startup] Redis caching enabled'); else console.log('[Startup] Redis disabled or not connected');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

// Global error / rejection handlers to avoid silent exits
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
});
