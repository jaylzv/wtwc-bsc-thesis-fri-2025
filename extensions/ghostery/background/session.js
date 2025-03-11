import { UPDATE_SESSION_ACTION_NAME } from '../store/session.js';
import '../utils/debug.js';
import { COOKIE_DOMAIN } from '../utils/api.js';

function refreshSession() {
  chrome.runtime.sendMessage({ action: UPDATE_SESSION_ACTION_NAME }).catch(() => null);
}
chrome.cookies.onChanged.addListener(async ({ cookie }) => {
  if (cookie.domain === COOKIE_DOMAIN && cookie.name === "access_token") {
    refreshSession();
  }
});
