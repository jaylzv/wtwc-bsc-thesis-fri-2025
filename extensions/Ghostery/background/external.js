import Session from '../store/session.js';
import { MergedStats } from '../store/daily-stats.js';
import store from '../npm/hybrids/src/store.js';

{
  const GHOSTERY_SEARCH_EXTENSION_IDS = [
    "nomidcdbhopffbhbpfnnlgnfimhgdman",
    // Chrome
    "search@ghostery.com"
    // Firefox
  ];
  const GHOSTERY_NEW_TAB_EXTENSION_IDS = ["newtab@ghostery.com"];
  chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
      if (GHOSTERY_SEARCH_EXTENSION_IDS.includes(sender.id)) {
        switch (message) {
          case "refreshToken":
            store.resolve(Session).then(({ user }) => sendResponse({ success: !!user }));
            return true;
          default:
            console.error(
              `[external] Unknown message type from "${sender.id}"`,
              message
            );
        }
      }
      if (GHOSTERY_NEW_TAB_EXTENSION_IDS.includes(sender.id)) {
        switch (message?.name) {
          case "getDashboardStats": {
            (async () => {
              const stats = await store.resolve(MergedStats);
              sendResponse(JSON.parse(JSON.stringify(stats)));
            })();
            return true;
          }
          case "getUser": {
            (async () => {
              const session = await store.resolve(Session);
              sendResponse(session.user && JSON.parse(JSON.stringify(session)));
            })();
            return true;
          }
          default:
            console.error(
              `[external] Unknown message type from "${sender.id}"`,
              message
            );
        }
      }
      return false;
    }
  );
}
