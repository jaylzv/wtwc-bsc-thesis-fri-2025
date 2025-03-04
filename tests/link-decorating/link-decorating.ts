import { Page } from "@playwright/test";
import { TestOptionsType } from "../../types";
import { LinkDecoratorType } from "./types";
import { getLinkDecoratorCombinations } from "./utils";

const decorateLink = (
  url: string,
  linkDecorators: ReadonlyArray<LinkDecoratorType>
): string => {
  let urlToDecorate: string = url;
  urlToDecorate += "?";

  // TODO: We can also add non-tracking parameters to better examine behavior.
  for (const linkDecorator of linkDecorators) {
    urlToDecorate += `${linkDecorator}=sample_${linkDecorator}_value&`;
  }

  return urlToDecorate;
};

const compareResults = (): void => {};

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

  compareResults();
};

export { testLinkDecorating };
