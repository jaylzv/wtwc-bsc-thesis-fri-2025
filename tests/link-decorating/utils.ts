import { CurrentArgumentsType } from "../../utils/types";
import { LINK_DECORATORS } from "./types";

import chalk from "chalk";
import Table from "cli-table3";

/**
 * Displays formatted results in the console for the 'Link Decorating' test.
 * 
 * @param {CurrentArgumentsType} currentArgs - The current arguments including browser and extensions.
 * @param {number} linkCleanlinessScore - The cleanliness score of the link.
 * @returns {void}
 */
const displayFormattedResultsInConsole = (
  currentArgs: CurrentArgumentsType,
  linkCleanlinessScore: number
): void => {
  const { browser, extensions } = currentArgs;

  console.log(chalk.bold.magenta("\n🔗 Results for 'Link Decorating' test:"));

  const table = new Table({
    head: [chalk.cyan("Category"), chalk.cyan("Details")],
    colWidths: [25, 50],
    wordWrap: true,
  });

  table.push(
    ["Browser", browser],
    ["Extensions", extensions.length ? extensions.join(", ") : "None"],
    ["Actual Cleanliness Score", chalk.blue(linkCleanlinessScore.toString())],
    ["Maximum Cleanliness Score (WORST)", chalk.red(LINK_DECORATORS.length.toString())],
    ["Minimum Cleanliness (BEST)", chalk.green("0")]
  );

  console.log(table.toString());
};

export { displayFormattedResultsInConsole };
