const { launchBrowser } = require("./launch-browser.js");
const { chromium } = require("@playwright/test");
launchBrowser(chromium);
