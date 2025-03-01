import { testAllScenarios } from "./tests";
import { TestEnum, TestType } from "./types";

/**
 * Parses command-line arguments and returns an object with boolean flags.
 *
 * The function processes the command-line arguments passed to the script,
 * starting from the third argument (index 2) and maps them to a predefined
 * set of boolean flags. The supported flags are:
 * - `all`
 * - `fingerprinting`
 * - `bounce_tracking`
 * - `link_decorating`
 * - `debug`
 *
 * If any of these flags are present in the command-line arguments, their
 * corresponding value in the returned object will be set to `true`.
 *
 * @returns An object where the keys are the supported flags and the values
 * are booleans indicating whether each flag was present in the command-line
 * arguments.
 */
const parseArgs = (): { [key: string]: boolean } => {
  const scriptArgs = process.argv.slice(2);

  const args: { [key: string]: boolean } = {
    all: false,
    fingerprinting: false,
    bounce_tracking: false,
    link_decorating: false,
    debug: false,
  };

  scriptArgs.forEach((arg) => {
    args[arg] = true;
  });

  return args;
};

/**
 * Determines whether a specific test should be run based on the provided arguments.
 *
 * @param {TestType} test - The type of test to check. It should be one of the predefined test types.
 * @returns {boolean} A boolean indicating whether the test should be run.
 *
 * The function parses command-line arguments to determine if the test should be executed.
 * If the `all` argument is provided or the specific test argument is set to true, the test will run.
 * If the specific test argument is not set, the test will be skipped.
 * If the arguments are not properly set, an error message will be logged, and the test will not run.
 *
 * Example test types include:
 * - "fingerprinting"
 * - "bounce_tracking"
 * - "link_decorating"
 * - "all" (to run all tests)
 * - "debug" (for debugging purposes)
 */
const shouldRunTest = (
  test: TestType,
  args: { [key: string]: boolean }
): boolean => {
  if (args.all || args[test]) {
    console.log(`Testing ${test.replace("_", " ")} scenarios...\n`);
    return true;
  } else if (!args[test]) {
    console.log(`Skipping ${test.replace("_", " ")} testing...\n`);
    return false;
  } else {
    console.error(
      `Please set an option to run the test. Options are "fingerprinting", 
      "bounce_tracking", "link_decorating", "all" for running tests, or "debug" for debugging.`
    );
    return false;
  }
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
    (await testAllScenarios(TestEnum.FINGERPRINTING, args.debug));
  shouldRunTest(TestEnum.BOUNCE_TRACKING, args) &&
    (await testAllScenarios(TestEnum.BOUNCE_TRACKING, args.debug));
  shouldRunTest(TestEnum.LINK_DECORATING, args) &&
    (await testAllScenarios(TestEnum.LINK_DECORATING, args.debug));
};

main();
