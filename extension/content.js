// CoursingStats RKF Tracker — Content Script
// Automatically detects active session on rkf.online and saves it to extension storage

function extractAuth() {
  try {
    const apikey = localStorage.getItem('apikey');
    let profileId = localStorage.getItem('profile_id') || '';
    const userInfoRaw = localStorage.getItem('user_info');
    let userUuid = '';
    if (userInfoRaw) {
      try {
        const u = JSON.parse(userInfoRaw);
        userUuid = u.uuid || u.alias || (u.id ? String(u.id) : '');
        if (!profileId && (u.profile_id || u.profileId)) {
          profileId = String(u.profile_id || u.profileId);
        }
      } catch (e) {}
    }

    if (apikey) {
      chrome.storage.local.set({
        rkfToken: apikey,
        profileId: profileId,
        userUuid: userUuid,
        lastAuthSync: Date.now()
      });
      return { apikey, profileId, userUuid };
    }
  } catch (err) {}
  return null;
}

// Extract on page load
extractAuth();

// Periodically check in case user just logged in
setInterval(extractAuth, 3000);

// Respond to popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_RKF_AUTH') {
    const data = extractAuth();
    sendResponse(data || { error: 'Not authenticated on rkf.online' });
  }
  return true;
});
