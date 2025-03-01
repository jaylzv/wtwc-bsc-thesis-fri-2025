import {
  DUMMY_FINGERPRINT_DATA,
  FingerprintDataType,
  FingerprintSiteOptionsType,
} from "../types";

const retrieveDeviceInfoFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  return DUMMY_FINGERPRINT_DATA;
};

export { retrieveDeviceInfoFingerprintData };
