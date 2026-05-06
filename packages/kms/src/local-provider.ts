import { 
  createCipheriv, 
  createDecipheriv, 
  randomBytes, 
  createHash 
} from "node:crypto";
import { EncryptedKey, KMSProvider } from "./types";
import { EncryptionError, DecryptionError, ConfigurationError } from "./errors";

export class LocalSecureProvider implements KMSProvider {
  private masterKey: Buffer;
  private keyVersion: string;

  constructor(config: { masterKey: string; keyVersion: string }) {
    if (!config.masterKey || config.masterKey.length < 32) {
      throw new ConfigurationError("LOCAL_KMS_MASTER_KEY must be at least 32 characters");
    }
    
    // Derived key for AES-256
    this.masterKey = createHash("sha256").update(config.masterKey).digest();
    this.keyVersion = config.keyVersion;
  }

  async createKey(metadata?: Record<string, any>): Promise<EncryptedKey> {
    try {
      // 1. Generate new secret (Demo: 32 bytes random)
      // In production, this would be a mnemonic or private key
      const secret = randomBytes(32).toString("hex");

      // 2. Encrypt using AES-256-GCM
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", this.masterKey, iv);
      
      let ciphertext = cipher.update(secret, "utf8", "hex");
      ciphertext += cipher.final("hex");
      
      const authTag = cipher.getAuthTag().toString("hex");

      return {
        ciphertext,
        iv: iv.toString("hex"),
        authTag,
        keyVersion: this.keyVersion,
        metadata,
      };
    } catch (error: any) {
      throw new EncryptionError("Failed to create and encrypt key", error);
    }
  }

  async sign(encryptedKey: EncryptedKey, payload: Buffer): Promise<Buffer> {
    const secret = await this.decrypt(encryptedKey);
    // TODO: Use real signing logic (e.g., kaspajs)
    // This is where the actual cryptographic signing happens
    console.log(`[LocalKMS] Signing payload with secret starting with ${secret.substring(0, 4)}...`);
    
    // Returning a dummy signature for now
    return createHash("sha256").update(Buffer.concat([Buffer.from(secret), payload])).digest();
  }

  async exportPublicKey(encryptedKey: EncryptedKey): Promise<string> {
    const secret = await this.decrypt(encryptedKey);
    // TODO: Derive public key from secret
    return `kaspa:mock_address_derived_from_${secret.substring(0, 8)}`;
  }

  async healthCheck(): Promise<boolean> {
    return !!this.masterKey;
  }

  /**
   * PRIVATE: Decrypt the ciphertext using master key
   * This should NEVER be exposed outside the provider class
   */
  private async decrypt(key: EncryptedKey): Promise<string> {
    try {
      const decipher = createDecipheriv(
        "aes-256-gcm", 
        this.masterKey, 
        Buffer.from(key.iv, "hex")
      );
      
      decipher.setAuthTag(Buffer.from(key.authTag, "hex"));
      
      let decrypted = decipher.update(key.ciphertext, "hex", "utf8");
      decrypted += decipher.final("utf8");
      
      return decrypted;
    } catch (error: any) {
      throw new DecryptionError("Failed to decrypt key (Invalid master key or corrupted data)", error);
    }
  }
}
