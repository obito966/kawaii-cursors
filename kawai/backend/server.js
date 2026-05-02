/**
 * Kawaii Cursors — Express Backend
 * Routes: POST /upload, GET /cursors, DELETE /cursors/:id, DELETE /cursors
 */

const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── IN-MEMORY CURSOR STORE (replace with MongoDB in production) ──────────────
let cursorStore = [];
let nextId = 1001;

// Load persisted cursors from cursors.json on startup
const STORE_FILE = path.join(__dirname, 'cursors.json');
if (fs.existsSync(STORE_FILE)) {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    cursorStore = JSON.parse(raw);
    if (cursorStore.length > 0) {
      nextId = Math.max(...cursorStore.map(c => c.id)) + 1;
    }
    console.log(`✓ Loaded ${cursorStore.length} saved cursors`);
  } catch (e) {
    console.error('Could not parse cursors.json, starting fresh');
  }
}

function persistStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(cursorStore, null, 2));
}

// ─── MULTER CONFIG ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext    = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `cursor-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.cur', '.ani', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, CUR, ANI, JPG, GIF, WEBP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * GET /
 * Health check
 */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: '✦ Kawaii Cursors API',
    version: '1.0.0',
    cursors: cursorStore.length
  });
});

/**
 * GET /cursors
 * Returns all uploaded cursors
 */
app.get('/cursors', (req, res) => {
  const { category } = req.query;
  let results = [...cursorStore];
  if (category && category !== 'all') {
    results = results.filter(c => c.cat === category);
  }
  res.json({ cursors: results, total: results.length });
});

/**
 * POST /upload
 * Upload a new cursor image
 * Body: { name, category } + file: cursor (multipart/form-data)
 */
app.post('/upload', upload.single('cursor'), (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newCursor = {
      id:        nextId++,
      name:      name.trim(),
      cat:       category.trim(),
      filename:  req.file.filename,
      originalname: req.file.originalname,
      size:      req.file.size,
      mimetype:  req.file.mimetype,
      type:      'uploaded',
      uploadedAt: new Date().toISOString()
    };

    cursorStore.push(newCursor);
    persistStore();

    console.log(`✓ Uploaded: ${newCursor.name} [${newCursor.cat}] — ${req.file.filename}`);
    res.status(201).json({ success: true, cursor: newCursor });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

/**
 * DELETE /cursors/:id
 * Delete a single cursor by ID
 */
app.delete('/cursors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cursor = cursorStore.find(c => c.id === id);

  if (!cursor) {
    return res.status(404).json({ error: 'Cursor not found' });
  }

  // Remove file from disk
  const filepath = path.join(__dirname, 'uploads', cursor.filename);
  if (fs.existsSync(filepath)) {
    try { fs.unlinkSync(filepath); } catch {}
  }

  cursorStore = cursorStore.filter(c => c.id !== id);
  persistStore();
  res.json({ success: true, deleted: id });
});

/**
 * DELETE /cursors
 * Delete ALL uploaded cursors (admin only)
 */
app.delete('/cursors', (req, res) => {
  // Remove all files
  cursorStore.forEach(c => {
    const filepath = path.join(__dirname, 'uploads', c.filename);
    if (fs.existsSync(filepath)) {
      try { fs.unlinkSync(filepath); } catch {}
    }
  });
  cursorStore = [];
  persistStore();
  res.json({ success: true, message: 'All cursors deleted' });
});

/**
 * GET /cursors/:id
 * Get a single cursor by ID
 */
app.get('/cursors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cursor = cursorStore.find(c => c.id === id);
  if (!cursor) return res.status(404).json({ error: 'Not found' });
  res.json({ cursor });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large — max 2MB' });
    }
  }
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✦ Kawaii Cursors API running at http://localhost:${PORT}`);
  console.log(`  POST /upload      — Upload a cursor`);
  console.log(`  GET  /cursors     — Fetch all cursors`);
  console.log(`  DELETE /cursors/:id — Delete cursor\n`);
});

module.exports = app;
