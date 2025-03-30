import { CurrentArgumentsType } from "../../utils/types";
import { LINK_DECORATORS } from "./types";

import chalk from "chalk";
import Table from "cli-table3";
/**
 * Displays formatted results in the console for the 'Link Decorating' test.
 */
const displayFormattedResultsInConsole = (
  currentArgs: CurrentArgumentsType,
  linkCleanlinessScore: number
): void => {
  const { browser, extensions } = currentArgs;

  console.log(chalk.bold.magenta("\nResults for 'Link Decorating' test:"));

  const table = new Table({
    head: [chalk.cyan("Category"), chalk.cyan("Details")],
    colWidths: [25, 50],
    wordWrap: true,
  });

  table.push(
    ["Browser", browser],
    ["Extensions", extensions.length ? extensions.join(", ") : "None"],
    ["Actual Cleanliness Score", chalk.blue(linkCleanlinessScore.toString())],
    ["Maximum Cleanliness Score", chalk.red(LINK_DECORATORS.length.toString())],
    ["Minimum Cleanliness", chalk.green("0")]
  );

  console.log(table.toString());
};

export { displayFormattedResultsInConsole };
