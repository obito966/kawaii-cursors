/**
 * Kawaii Cursors Extension — Background Service Worker
 * Handles install events and cross-tab cursor sync.
 */

'use strict';

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    console.log('✦ Kawaii Cursors extension installed!');
  } else if (details.reason === 'update') {
    console.log('✦ Kawaii Cursors extension updated to', chrome.runtime.getManifest().version);
  }
});

// Re-apply cursor on tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome://')) return;

  chrome.storage.local.get(['kawaii_active_cursor'], result => {
    const cursor = result['kawaii_active_cursor'];
    if (!cursor) return;
    chrome.tabs.sendMessage(tabId, { action: 'APPLY_CURSOR', cursor }).catch(() => {
      // Tab might not have content script yet — that's OK
    });
  });
});
