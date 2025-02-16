import {
  testFingerprinting,
  testBounceTracking,
  testLinkDecorating,
} from "./utils/testing";

const main = async () => {
  await testFingerprinting();
  await testBounceTracking();
  await testLinkDecorating();
};

main();
