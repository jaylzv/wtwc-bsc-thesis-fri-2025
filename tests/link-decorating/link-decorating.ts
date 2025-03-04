import { Page } from "@playwright/test";
import { TestOptionsType } from "../../types";
import { LinkDecoratorType } from "./types";
import { getLinkDecoratorCombinations } from "./utils";

const decorateLink = (
  url: string,
  linkDecorators: ReadonlyArray<LinkDecoratorType>
): string => {
  return `TODO: ${url}`;
};

const compareResults = (page: Page): void => {};

const testLinkDecorating = async (
  testOptions: TestOptionsType
): Promise<void> => {
  const { page } = testOptions;

  const linkDecoratorCombinations = getLinkDecoratorCombinations();

  for (const linkDecoratorCombination of linkDecoratorCombinations) {
    const templateLink = "https://example.com";
    const decoratedLink = decorateLink(templateLink, linkDecoratorCombination);
    await page.goto(decoratedLink);
  }

  compareResults(page);
};

export { testLinkDecorating };
