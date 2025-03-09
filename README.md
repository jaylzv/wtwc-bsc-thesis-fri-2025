# Bachelor's Thesis Project: Privacy-Preserving Cookieless Tracking: Techniques, Challenges, and Innovations

This repository contains the code and documentation for my bachelor's thesis project. The project aims to evaluate the effectiveness of various privacy measures implemented by different web browsers, search engines and extensions. By running a series of automated tests, the project assesses how well these measures protect users against common tracking techniques such as fingerprinting and bounce tracking.

## Features

- Automated testing of privacy measures across multiple browsers and search engines.
- Customizable test configurations, allowing users to specify which tests, browsers, and search engines to use.
- Debug mode for detailed logging and troubleshooting.

### Note:

I am using node v22.13.1, npm v10.9.2 and WSL2 for development. Since currently a Docker Image is not offered.

## Usage

To get started, clone the repository and install the dependencies:

```sh
git clone <repository-url>
cd <repository-directory>
npm install
```

You can then run the tests using the following commands:

```sh
npm run main -- [options]
```

### Options

- `-a`, `--all`: Run all tests.
- `-t`, `--tests`: Specify tests to run (comma-separated).
- `-b`, `--browsers`: Specify browsers to use (comma-separated).
- `-s`, `--search-engines`: Specify search engines to use (comma-separated).
- `-e`, `--extensions`: Specify extensions to use (comma-separated).
- `-w`, `--websites`: Specify websites to test (comma-separated).
- `-d`, `--debug`: Enable debug mode.
- `-h`, `--headless`: Enable headless mode. (Better performance).

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

Enable debug mode:

```sh
npm run main -- --debug
```

Combine browsers and search engines (this can apply to all different options):

```sh
npm run main -- --browsers chrome,firefox --search-engines google,bing
```
