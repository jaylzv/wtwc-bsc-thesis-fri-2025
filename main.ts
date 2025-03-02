import { testAllScenarios } from "./tests";
import { ArgumentsType, TestEnum, TestType } from "./types";
import { BrowsersType } from "./utils/browsers/types";
import { SearchEngineType } from "./utils/search-engines/types";

/**
 * Parses command-line arguments and returns an object containing the parsed values.
 *
 * The function processes the following arguments:
 * - `--all` or `-a`: Sets the `all` property to `true`.
 * - `--test` or `-t`: Adds the specified tests to the `tests` array.
 * - `--browser` or `-b`: Adds the specified browsers to the `browsers` array.
 * - `--search-engine` or `-s`: Adds the specified search engines to the `searchEngines` array.
 * - `--extension` or `-e`: Adds the specified extensions to the `extensions` array.
 * - `--website` or `-w`: Adds the specified websites to the `websites` array.
 * - `--debug` or `-d`: Sets the `debug` property to `true`.
 *
 * If no arguments are provided, or if `--all` or `-a` is included, the `all` property is set to `true`.
 *
 * @returns {ArgumentsType} An object containing the parsed arguments.
 */
const parseArgs = (): ArgumentsType => {
  const scriptArgs = process.argv.slice(2);

  const args: ArgumentsType = {
    all: false,
    debug: false,
    tests: [],
    browsers: [],
    searchEngines: [],
    extensions: [],
    websites: [],
  };

  if (
    scriptArgs.length === 0 ||
    scriptArgs.includes("--all") ||
    scriptArgs.includes("-a")
  ) {
    args.all = true;
    return args;
  } else {
    scriptArgs.forEach((arg) => {
      const [key, value] = arg.split("=");

      switch (key) {
        case "--test":
        case "-t":
          args.tests.push(...(value.split(",") as TestType[]));
          break;
        case "--browser":
        case "-b":
          args.browsers.push(...(value.split(",") as BrowsersType[]));
          break;
        case "--search-engine":
        case "-s":
          args.searchEngines.push(...(value.split(",") as SearchEngineType[]));
          break;
        case "--extension":
        case "-e":
          args.extensions.push(...value.split(","));
          break;
        case "--website":
        case "-w":
          args.websites.push(...value.split(","));
          break;
        case "--debug":
        case "-d":
          args.debug = true;
          break;
        default:
          console.error(
            `Invalid argument: ${key}. Please provide a valid argument.`
          );
          break;
      }
    });
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
  return args.all || args.tests.includes(test);
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
