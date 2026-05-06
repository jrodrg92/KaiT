export interface EncryptedKey {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
  metadata?: Record<string, any>;
}

export interface KMSProvider {
  /**
   * Generates a new secure key (mnemonic or private key)
   * returns the encrypted representation.
   */
  createKey(metadata?: Record<string, any>): Promise<EncryptedKey>;

  /**
   * Signs a transaction hash or payload using the stored key.
   */
  sign(encryptedKey: EncryptedKey, payload: Buffer): Promise<Buffer>;

  /**
   * Extracts the public address/key from an encrypted payload.
   */
  exportPublicKey(encryptedKey: EncryptedKey): Promise<string>;

  /**
   * Verifies connectivity to the provider.
   */
  healthCheck(): Promise<boolean>;
}
