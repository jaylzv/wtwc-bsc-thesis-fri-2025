const { launchBrowser } = require("./launch-browser.js");
const { firefox } = require("@playwright/test");
launchBrowser(firefox);
