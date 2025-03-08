import { CurrentArgumentsType } from "../../types";
import { LINK_DECORATORS } from "./types";

/**
 * Formats and logs a message to the console with a specified color.
 *
 * @param {string} color - The color code for the log message.
 * @param {string} key - The key or label for the log message.
 * @param {string} [value] - The optional value to be logged alongside the key.
 */
const formatLog = (color: string, key: string, value?: string) => {
  console.log(color, key, "\x1b[0m", value ?? "");
};

/**
 * Displays formatted results in the console for the 'Link Decorating' test.
 *
 * @param {CurrentArgumentsType} currentArgs - The current arguments including search engine, browser, and extensions.
 * @param {number} linkCleanlinessScore - The cleanliness score of the link.
 */
const displayFormattedResultsInConsole = (
  currentArgs: CurrentArgumentsType,
  linkCleanlinessScore: number
): void => {
  const { searchEngine, browser, extensions } = currentArgs;

  formatLog("\x1b[35m", "\nResults for 'Link Decorating' test:");
  console.log("-----------------------------------------");
  formatLog("\x1b[36m", "- Browser:", browser);
  formatLog("\x1b[36m", "- Search engine:", searchEngine);
  formatLog("\x1b[36m", "- Extensions:", extensions.join(", "));
  console.log("-----------------------------------------");
  formatLog(
    "\x1b[34m",
    "Actual link cleanliness score: ",
    linkCleanlinessScore.toString()
  );
  formatLog(
    "\x1b[31m",
    "Maximum cleanliness score: ",
    LINK_DECORATORS.length.toString()
  );
  formatLog("\x1b[32m", "Minimum cleanliness: ", "0");
};

export { formatLog, displayFormattedResultsInConsole };
