import { testAllScenarios } from "./tests";
import { TestEnum } from "./types";

const main = async () => {
  await testAllScenarios(TestEnum.FINGERPRINTING);
  await testAllScenarios(TestEnum.BOUNCE_TRACKING);
  await testAllScenarios(TestEnum.LINK_DECORATING);
};

main();
