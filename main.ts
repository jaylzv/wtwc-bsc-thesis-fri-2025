import {
  testAllScenarios,
  testFingerprinting,
  testBounceTracking,
  testLinkDecorating,
} from "./tests";

const main = async () => {
  await testAllScenarios(testFingerprinting);
  await testAllScenarios(testBounceTracking);
  await testAllScenarios(testLinkDecorating);
};

main();
