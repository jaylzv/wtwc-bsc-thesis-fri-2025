const { launchBrowser } = require("./launch-browser.js");
const { webkit } = require("@playwright/test");
launchBrowser(webkit);
