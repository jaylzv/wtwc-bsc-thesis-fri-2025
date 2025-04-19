# Bachelor's Thesis Project: Privacy-Preserving Cookieless Tracking: Techniques, Challenges, and Innovations

This repository contains the code and documentation for my bachelor's thesis project. The project aims to evaluate the effectiveness of various privacy measures implemented by different web browsers, search engines and extensions. By running a series of automated tests, the project assesses how well these measures protect users against common tracking techniques such as fingerprinting, bounce tracking and link decorating.

## Features

- Automated testing of privacy measures across multiple browsers, search engines and extensions.
- Customizable test configurations, allowing users to specify which tests, browsers, search engines and extensions to use.

### Note:

I am using node v22.13.1, npm v10.9.2 and WSL2 for development. Since currently a Docker Image is not offered.

## Usage

To get started, clone the repository and install the dependencies:

```sh
git clone <repository-url>
cd <repository-directory>
npm install
```

Install the dependencies and browsers needed to run the browser automation tests with Playwright:

```sh
npx playwright install-deps
npx playwright install chromium firefox webkit
```

If you connectivity issues, you can increase the timeout, as the default timeout for downloading the browsers is 30 seconds. For example:

```sh
PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=900000 npx playwright install chromium firefox webkit
```

You can then run the tests using the following commands:

```sh
npm run main -- [options]
```

### Options

- `-a`, `--all`: Run all tests.
- `-t`, `--tests`: Specify tests to run (comma-separated).
  - _Available tests_: `link_decorating`, `fingerprinting`, `bounce_tracking`.
- `-b`, `--browsers`: Specify browsers to use (comma-separated).
  - _Available browsers_: `chromium`, `firefox`, `webkit`.
- `-s`, `--search-engines`: Specify search engines to use (comma-separated).
  - _Available search engines_: `google`, `bing`, `startpage`, `duckduckgo`, `yahoo`, `search.brave`, `mojeek`, `qwant`.
- `-e`, `--extensions`: Specify extensions to use (comma-separated).
  - _Available extensions_: `ublockorigin`, `privacybadger`, `ghostery`, `canvasblocker`, `clearurls` or `empty` if you wish to test without extensions.
- `-h`, `--headed`: Enable headed mode. (Enables GUI. Worse performance).
- `-w`, `--websites`: Specify which websites to test from for fingerprinting.
  - _Available websites_: `browserscan`.

### Examples

Run all tests:

```sh
npm run main -- --all
```

Run specific tests:

```sh
npm run main -- --tests fingerprinting,bounce_tracking
```

Specify browsers:

```sh
npm run main -- --browsers chrome,firefox
```

Specify search engines:

```sh
npm run main -- --search-engines google,bing
```

Combine browsers and search engines in headed mode (this can apply to all different options):

```sh
npm run main -- -b chrome,firefox --search-engines google,bing --headed
```

### Checkpoint Script

The repository includes a `checkpoint.sh` script that helps track and record test behavior at specific points in time. This is particularly useful for monitoring how privacy measures change over time or comparing results across different test runs.

Usage:

```sh
./checkpoint.sh "command to execute"
```

The script executes the given command and saves its output (both stdout and stderr) to a timestamped file in the `checkpoints/` directory. The filename format is `YYYY-MM-DD_HH:MM:SS.txt`.

Example:

```sh
./checkpoint.sh "npm run main -- -t link_decorating -s startpage -h -e empty -b webkit"
```

This will create a file like `checkpoints/2024-01-20_15:30:45.txt` containing the complete output of the test run, allowing you to reference or compare results later.
