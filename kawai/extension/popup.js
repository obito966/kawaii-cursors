/**
 * Kawaii Cursors Extension — Popup Script
 */

'use strict';

const STORAGE_KEY = 'kawaii_active_cursor';
let selectedEmoji = null;
let selectedName  = null;

// ─── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load previously selected cursor
  chrome.storage.local.get([STORAGE_KEY], result => {
    const saved = result[STORAGE_KEY];
    if (saved && saved.emoji) {
      markSelected(saved.emoji);
      selectedEmoji = saved.emoji;
      selectedName  = saved.name;
    }
  });

  // Cursor item clicks
  document.querySelectorAll('.cursor-item').forEach(item => {
    item.addEventListener('click', () => {
      const emoji = item.dataset.emoji;
      const name  = item.dataset.name;
      selectedEmoji = emoji;
      selectedName  = name;
      markSelected(emoji);
    });
  });

  // Apply button
  document.getElementById('applyBtn').addEventListener('click', applyCursor);

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetCursor);
});

function markSelected(emoji) {
  document.querySelectorAll('.cursor-item').forEach(i => {
    i.classList.toggle('active', i.dataset.emoji === emoji);
  });
}

function applyCursor() {
  if (!selectedEmoji) {
    alert('Please select a cursor first!');
    return;
  }

  const cursorData = { type: 'emoji', emoji: selectedEmoji, name: selectedName };

  // Save to storage
  chrome.storage.local.set({ [STORAGE_KEY]: cursorData });

  // Send to active tab
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'APPLY_CURSOR',
      cursor: cursorData
    }, response => {
      if (chrome.runtime.lastError) {
        // Inject content script if not already present
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }).then(() => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'APPLY_CURSOR',
            cursor: cursorData
          });
        });
      }
    });
  });
}

function resetCursor() {
  selectedEmoji = null;
  selectedName  = null;
  document.querySelectorAll('.cursor-item').forEach(i => i.classList.remove('active'));
  chrome.storage.local.remove(STORAGE_KEY);

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'RESET_CURSOR' });
  });
}
