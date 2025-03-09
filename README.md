# Bachelor's thesis repository: Privacy-Preserving Cookieless Tracking: Techniques, Challenges, and Innovations

## How to Run the Script

To run the script, use the following command:

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
