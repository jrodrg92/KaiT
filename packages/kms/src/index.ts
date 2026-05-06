export * from "./types";
export * from "./errors";
export * from "./local-provider";

import { LocalSecureProvider } from "./local-provider";
import { KMSProvider } from "./types";

/**
 * Factory for creating KMS providers based on environment configuration.
 */
export function createKMSProvider(): KMSProvider {
  const type = process.env.KMS_PROVIDER || "local";

  switch (type) {
    case "local":
      return new LocalSecureProvider({
        masterKey: process.env.LOCAL_KMS_MASTER_KEY || "default_local_master_key_change_me_immediately",
        keyVersion: process.env.LOCAL_KMS_KEY_VERSION || "v1",
      });
    default:
      throw new Error(`Unsupported KMS provider: ${type}`);
  }
}
