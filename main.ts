import testAllScenarios from "./utils/testing";
import testFingerprinting from "./utils/fingerprinting";
import testBounceTracking from "./utils/bounce-tracking";
import testLinkDecorating from "./utils/link-decorating";

const main = async () => {
  await testAllScenarios(testFingerprinting);
  await testAllScenarios(testBounceTracking);
  await testAllScenarios(testLinkDecorating);
};

main();
