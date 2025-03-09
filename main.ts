import { testAllScenarios } from "./tests";
import { ArgumentsType, TestEnum, TestType } from "./types";
import { BROWSERS, BrowsersType } from "./utils/browsers/types";
import { SEARCH_ENGINES, SearchEngineType } from "./utils/search-engines/types";

const POSSIBLE_CLI_ARGS = [
  "-a",
  "--all",
  "-t",
  "--tests",
  "-b",
  "--browsers",
  "-s",
  "--search-engines",
  "-e",
  "--extensions",
  "-w",
  "--websites",
  "-d",
  "--debug",
];

const parseArgs = (): ArgumentsType => {
  const scriptArgs = process.argv.slice(2);

  const args: ArgumentsType = {
    tests: Object.values(TestEnum),
    browsers: BROWSERS,
    searchEngines: SEARCH_ENGINES,
    extensions: ["uBlockOrigin"], // TODO: Implement.
    websites: [], // TODO: Implement.
    debug: false, // TODO: Implement?
  };

  if (scriptArgs.length === 0) {
    console.log(`
      Usage: npm run main -- [options]
      
      Options:
        -a, --all                Run all tests
        -t, --tests              Specify tests to run (comma-separated)
        -b, --browsers           Specify browsers to use (comma-separated)
        -s, --search-engines     Specify search engines to use (comma-separated)
        -e, --extensions         Specify extensions to use (comma-separated)
        -w, --websites           Specify websites to test (comma-separated)
        -d, --debug              Enable debug mode

      Examples:
        npm run main -- -a
        # Runs all tests with default settings.

        npm run main -- -t fingerprinting,link_decorating -b chrome,firefox
        # Runs fingerprinting and link decorating tests on Chrome and Firefox.

        npm run main -- -t bounce_tracking -s google,bing
        # Runs bounce tracking test using Google and Bing search engines.

        npm run main -- -b chrome -e uBlockOrigin,AdblockPlus
        # Runs all tests on Chrome with uBlockOrigin and AdblockPlus extensions.

        npm run main -- -s google -w example.com,anotherexample.com
        # Runs all tests using Google search engine on specified websites.

        npm run main -- -t fingerprinting -d
        # Runs fingerprinting test with debug mode enabled.

      Note:
        If some arguments are not included, all of the values for that arg are tested by default.
    `);
    process.exit(0);
  } else if (!scriptArgs.includes("-a") && !scriptArgs.includes("--all")) {
    for (const cliArg of POSSIBLE_CLI_ARGS) {
      if (scriptArgs.includes(cliArg)) {
        const index = scriptArgs.indexOf(cliArg);
        const value = scriptArgs[index + 1];

        if (value === undefined) {
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
            args.extensions = value.split(",");
            break;
          case "-w":
          case "--websites":
            args.websites = value.split(",");
            break;
          case "-d":
          case "--debug":
            args.debug = true;
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
