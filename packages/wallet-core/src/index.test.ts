import { MockKMSProvider, WalletManager } from "./index";
import { describe, it, expect } from "vitest";

describe("MockKMSProvider", () => {
  const kms = new MockKMSProvider();

  it("should encrypt and decrypt a mnemonic correctly", async () => {
    const text = "correct horse battery staple";
    const encrypted = await kms.encrypt(text);
    expect(encrypted).not.toBe(text);
    
    const decrypted = await kms.decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it("should throw an error on invalid decryption", async () => {
    await expect(kms.decrypt("invalid-cipher")).rejects.toThrow();
  });
});

describe("WalletManager", () => {
  const kms = new MockKMSProvider();
  const wallet = new WalletManager(kms);

  it("should generate a wallet with encrypted secret", async () => {
    const result = await wallet.generateWallet();
    expect(result.address).toContain("kaspa:mock_");
    expect(result.encryptedSecret).toBeDefined();
    
    const decrypted = await kms.decrypt(result.encryptedSecret);
    expect(decrypted).toContain("mock mnemonic");
  });
});
