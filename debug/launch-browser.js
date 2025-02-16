const launchBrowser = async (browser) => {
  const browserInstance = await browser.launch({
    headless: false,
    devtools: true,
  });
  await browserInstance.newPage();
  await new Promise(() => {}); // This will keep the page open indefinitely
};

module.exports = { launchBrowser };
