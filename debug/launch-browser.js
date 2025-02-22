const launchBrowser = async (browser) => {
  const browserInstance = await browser.launch({
    headless: false,
    devtools: true,
  });
  const context = await browserInstance.newContext({ locale: "en-GB" });
  await context.newPage();
  await new Promise(() => {}); // This will keep the page open indefinitely
};

module.exports = { launchBrowser };
