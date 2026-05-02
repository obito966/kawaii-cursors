# ✦ Kawaii Cursors

> Premium kawaii cursor collection — animated, anime, games, funny, futuristic & AI cursors.

## 🚀 Quick Start

### Frontend (Static)
Open `frontend/index.html` in any browser. Works standalone without the backend — cursors, filters, search, admin panel, and upload UI all work locally.

### Backend (Node.js)
```bash
cd backend
npm install
npm start
# Server runs at http://localhost:3000
```

**Dev mode** (auto-reload):
```bash
npm run dev
```

### Chrome Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `/extension` folder
5. Click the extension icon in your toolbar

---

## 📁 Project Structure

```
kawaii-cursors/
├── frontend/
│   ├── index.html      ← Main page
│   ├── style.css       ← All styles (dark/light theme)
│   └── script.js       ← Filter, preview, upload, admin logic
│
├── backend/
│   ├── server.js       ← Express API
│   ├── package.json
│   ├── cursors.json    ← Auto-generated cursor database
│   └── uploads/        ← Uploaded cursor files
│
└── extension/
    ├── manifest.json   ← Chrome extension config (MV3)
    ├── content.js      ← Applies cursors to any website
    ├── background.js   ← Service worker
    ├── popup.html      ← Extension popup UI
    └── popup.js        ← Popup logic
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| GET | `/cursors` | Fetch all uploaded cursors |
| GET | `/cursors?category=anime` | Filter by category |
| GET | `/cursors/:id` | Get single cursor |
| POST | `/upload` | Upload cursor (multipart/form-data) |
| DELETE | `/cursors/:id` | Delete single cursor |
| DELETE | `/cursors` | Delete all cursors |

**Upload example (cURL):**
```bash
curl -X POST http://localhost:3000/upload \
  -F "name=My Cursor" \
  -F "category=anime" \
  -F "cursor=@/path/to/cursor.png"
```

---

## 🎨 Features

- **18 built-in cursors** across 6 categories
- **Live cursor preview** — click any cursor to apply it on the page
- **Canvas-based emoji cursors** — downloads real PNG files
- **Drag & drop upload** with validation
- **Admin panel** (password: `kawaii123`) — manage, filter, delete cursors
- **Dark / Light theme** toggle with localStorage persistence
- **Responsive** — works on mobile and desktop
- **Chrome Extension** — apply cursors on any website

---

## 🛠 Customization

### Change Admin Password
In `frontend/script.js`, line 9:
```js
const ADMIN_PASSWORD = 'your-new-password';
```

### Add MongoDB
Replace the in-memory `cursorStore` in `backend/server.js` with a Mongoose model:
```js
const mongoose = require('mongoose');
await mongoose.connect(process.env.MONGO_URI);
```

### Deploy
- **Frontend**: Upload `/frontend` to Netlify, Vercel, or GitHub Pages
- **Backend**: Deploy to Railway, Render, or Heroku
- Update `API_BASE` in `frontend/script.js` to your deployed backend URL

---

## 📦 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JS (no frameworks)
- **Backend**: Node.js, Express, Multer
- **Extension**: Chrome MV3, Service Worker
- **Storage**: JSON file (swap for MongoDB in production)

---

Made with 💖 by Kawaii Cursors
