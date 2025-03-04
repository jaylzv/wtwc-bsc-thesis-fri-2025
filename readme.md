# Bachelor's thesis repository: Privacy-Preserving Cookieless Tracking: Techniques, Challenges, and Innovations

## Passing Arguments

To run the CLI script with specific arguments, use the following format:

```sh
npm run main -- "argument1=value1,value2" "argument2=value3" ...
```

If no arguments are provided, all tests are run for everything.

### Available Arguments

- `--all` or `-a`: Run all tests.
- `--test` or `-t`: Specify tests to run (comma-separated values).
  - Example: `"--test=fingerprinting,bounce_tracking"`
  - Possible values: `fingerprinting`, `bounce_tracking`, `link_decorating`
- `--browser` or `-b`: Specify browsers to use (comma-separated values).
  - Example: `"--browser=chromium,firefox"`
  - Possible values: `chromium`, `firefox`, `safari`
- `--search-engine` or `-s`: Specify search engines to use (comma-separated values).
  - Example: `"--search-engine=google,bing"`
  - Possible values: `google`, `bing`, `duckduckgo`
- `--extension` or `-e`: Specify extensions to use (comma-separated values).
  - Example: `"--extension=adblocker,privacybadger"`
  - Possible values: `adblocker`, `privacybadger`, `ghostery`
- `--website` or `-w`: Specify websites to test (comma-separated values).
  - Example: `"--website=example.com,anotherexample.com"`
  - Possible values: `example.com`, `anotherexample.com`, `yetanotherexample.com`
  - Note: When specifying websites, only one test method should be selected and websites should be intended for that website.
    // TODO: Implement which websites for which method.
- `--debug` or `-d`: Enable debug mode.

### Examples

Run all tests:

```sh
npm run main -- "--all"
```

Run specific tests:

```sh
npm run main -- "--test=fingerprinting,bounce_tracking"
```

Specify browsers and search engines:

```sh
npm run main -- "--browser=chrome,firefox" "--search-engine=google,bing"
```

Enable debug mode:

```sh
npm run main -- "--debug"
```
