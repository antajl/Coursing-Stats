// CoursingStats RKF Tracker — Website Bridge Script
// Runs on coursing-stats.ru and localhost to communicate with the Tracker web app

(function() {
  'use strict';

  // Inform the web page that extension is present
  try {
    window.__CS_TRACKER_EXTENSION_INSTALLED__ = true;
    window.postMessage({ type: 'CS_EXTENSION_READY', version: '1.1.0' }, '*');
  } catch (e) {}

  // Proactively send active token to web app if already present
  function checkAndBroadcastToken() {
    try {
      chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid', 'cached_apps'], (data) => {
        if (chrome.runtime.lastError) return;
        if (data && data.rkfToken) {
          window.postMessage({
            type: 'CS_EXTENSION_TOKEN_AVAILABLE',
            token: data.rkfToken,
            profileId: data.profileId || null,
            userUuid: data.userUuid || null,
            applications: data.cached_apps || [],
            installed: true
          }, '*');
        }
      });
    } catch (e) {}
  }

  // Check immediately and on storage change
  checkAndBroadcastToken();

  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.rkfToken) {
        checkAndBroadcastToken();
      }
    });
  } catch (e) {}

  // Listen to messages from the web app (TrackerPage / TrackerAuthModal)
  window.addEventListener('message', (event) => {
    // Only accept messages from current window
    if (event.source !== window || !event.data) return;

    if (event.data.type === 'CS_GET_EXTENSION_TOKEN' || event.data.type === 'CS_TRACKER_PING') {
      try {
        chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid', 'cached_apps'], (data) => {
          if (chrome.runtime.lastError) {
            window.postMessage({ type: 'CS_EXTENSION_TOKEN_RESPONSE', token: null, error: chrome.runtime.lastError.message }, '*');
            return;
          }
          window.postMessage({
            type: 'CS_EXTENSION_TOKEN_RESPONSE',
            token: (data && data.rkfToken) ? data.rkfToken : null,
            profileId: (data && data.profileId) ? data.profileId : null,
            userUuid: (data && data.userUuid) ? data.userUuid : null,
            applications: (data && data.cached_apps) ? data.cached_apps : [],
            installed: true
          }, '*');
        });
      } catch (err) {
        window.postMessage({ type: 'CS_EXTENSION_TOKEN_RESPONSE', token: null, error: String(err) }, '*');
      }
    }
  });
})();
