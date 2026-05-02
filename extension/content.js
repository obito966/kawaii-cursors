/**
 * Kawaii Cursors — Content Script
 * Applies the selected cursor to every page automatically.
 */

'use strict';

const STORAGE_KEY = 'kawaii_active_cursor';

// ─── Apply stored cursor on load ─────────────────────────────────────────────
(function init() {
  chrome.storage.local.get([STORAGE_KEY], result => {
    const cursorData = result[STORAGE_KEY];
    if (cursorData) {
      applyCursor(cursorData);
    }
  });
})();

// ─── Listen for messages from popup ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'APPLY_CURSOR') {
    applyCursor(message.cursor);
    sendResponse({ success: true });
  }
  if (message.action === 'RESET_CURSOR') {
    resetCursor();
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async
});

// ─── Apply cursor to document ─────────────────────────────────────────────────
function applyCursor(cursor) {
  if (!cursor) return;

  let style = document.getElementById('kawaii-cursor-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'kawaii-cursor-style';
    document.head.appendChild(style);
  }

  if (cursor.type === 'url' && cursor.url) {
    style.textContent = `
      *, *::before, *::after {
        cursor: url('${cursor.url}') ${cursor.hotspotX || 0} ${cursor.hotspotY || 0}, auto !important;
      }
    `;
  } else if (cursor.type === 'emoji' && cursor.emoji) {
    // Create canvas data URL for emoji cursor
    const canvas = document.createElement('canvas');
    canvas.width = 48; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cursor.emoji, 24, 24);
    const dataUrl = canvas.toDataURL();
    style.textContent = `
      *, *::before, *::after {
        cursor: url('${dataUrl}') 16 16, auto !important;
      }
    `;
  }
}

// ─── Reset cursor ─────────────────────────────────────────────────────────────
function resetCursor() {
  const style = document.getElementById('kawaii-cursor-style');
  if (style) style.remove();
}
