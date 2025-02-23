/* empty css                  */
import '../../ui/localize.js';
import '../../ui/elements.js';
import Options from '../../store/options.js';
import Settings from './settings.js';
import './elements.js';
import store from '../../npm/hybrids/src/store.js';
import mount from '../../npm/hybrids/src/mount.js';

store.resolve(Options).then(({ terms, managed }) => {
  if (!terms || managed) throw new Error("Access denied");
  chrome.runtime.sendMessage({ action: "syncOptions" });
  mount(document.body, Settings);
}).catch(() => {
  window.location.replace(
    chrome.runtime.getURL("/pages/onboarding/index.html")
  );
});
