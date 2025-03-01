import {
  DUMMY_FINGERPRINT_DATA,
  FingerprintDataType,
  FingerprintSiteOptionsType,
} from "../types";

const retrieveBrowserScanFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  return DUMMY_FINGERPRINT_DATA;
};

export { retrieveBrowserScanFingerprintData };
