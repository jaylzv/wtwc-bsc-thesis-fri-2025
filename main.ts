import { testAllScenarios } from "./tests";
import { ArgumentsType, TestEnum, TestType } from "./utils/types";
import { BROWSERS, BrowsersType } from "./utils/browsers/types";
import { logCLIHelp } from "./utils/general-utils";
import { SEARCH_ENGINES, SearchEngineType } from "./utils/search-engines/types";
import { POSSIBLE_CLI_ARGS } from "./utils/consts";
import { EXTENSIONS } from "./utils/extensions/types";

/**
 * Parses command-line arguments and returns an object containing the parsed values.
 *
 * The function supports the following arguments:
 * - `-a`, `--all`: Run all tests.
 * - `-t`, `--tests`: Specify tests to run (comma-separated).
 * - `-b`, `--browsers`: Specify browsers to use (comma-separated).
 * - `-s`, `--search-engines`: Specify search engines to use (comma-separated).
 * - `-e`, `--extensions`: Specify extensions to use (comma-separated).
 * - `-h`, `--headless`: Enable headless mode.
 * - `-w`, `--websites`: Specify which websites to visit.
 *
 * If no arguments are provided, the function logs the CLI help and exits the process.
 * If an argument that is not `all` or `headless` is provided without a value, the function logs an error and exits the process.
 *
 * @returns {ArgumentsType} An object containing the parsed arguments.
 */
const parseArgs = (): ArgumentsType => {
  const scriptArgs = process.argv.slice(2);

  const args: ArgumentsType = {
    tests: Object.values(TestEnum),
    browsers: BROWSERS,
    searchEngines: SEARCH_ENGINES,
    extensions: EXTENSIONS,
    headless: false,
    websites: ["all"],
  };

  if (scriptArgs.length === 0) {
    logCLIHelp();
    process.exit(0);
  } else if (!scriptArgs.includes("-a") && !scriptArgs.includes("--all")) {
    for (const cliArg of POSSIBLE_CLI_ARGS) {
      if (scriptArgs.includes(cliArg)) {
        const index = scriptArgs.indexOf(cliArg);
        const value = scriptArgs[index + 1];

        if (
          value === undefined &&
          cliArg !== "-d" &&
          cliArg !== "-h" &&
          cliArg !== "--headless"
        ) {
          console.error(`No value provided for ${cliArg}.`);
          process.exit(1);
        }

        switch (cliArg) {
          case "-t":
          case "--tests":
            args.tests = value.split(",") as TestType[];
            break;
          case "-b":
          case "--browsers":
            args.browsers = value.split(",") as BrowsersType[];
            break;
          case "-s":
          case "--search-engines":
            args.searchEngines = value.split(",") as SearchEngineType[];
            break;
          case "-e":
          case "--extensions":
            args.extensions = value.includes("empty") ? [] : value.split(",");
            break;
          case "-h":
          case "--headless":
            args.headless = true;
            break;
          case "-w":
          case "--websites":
            args.websites = value.split(",");
            break;
          default:
            console.error(`Invalid argument: ${cliArg}`);
            process.exit(1);
        }
      }
    }
  }

  return args;
};

/**
 * Determines whether a specific test should be run based on the provided arguments.
 *
 * @param {TestType} test - The test to check.
 * @param {ARgumentsType} args - The arguments that specify which tests to run.
 * @returns `true` if the test should be run, `false` otherwise.
 */
const shouldRunTest = (test: TestType, args: ArgumentsType): boolean => {
  return args.tests.includes(test);
};

/**
 * The main function that runs tests for different scenarios based on the provided test enumeration.
 * It checks if each test should run and, if so, runs all scenarios for that test.
 *
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when all applicable tests have been run.
 */
const main = async (): Promise<void> => {
  const args = parseArgs();

  shouldRunTest(TestEnum.FINGERPRINTING, args) &&
    (await testAllScenarios(TestEnum.FINGERPRINTING, args));
  shouldRunTest(TestEnum.BOUNCE_TRACKING, args) &&
    (await testAllScenarios(TestEnum.BOUNCE_TRACKING, args));
  shouldRunTest(TestEnum.LINK_DECORATING, args) &&
    (await testAllScenarios(TestEnum.LINK_DECORATING, args));
};

main();
