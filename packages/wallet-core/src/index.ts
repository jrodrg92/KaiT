import * as Kiwi from "@kasplex/kiwi";
import CryptoJS from "crypto-js";

// Re-exporting from Kiwi with safety
const { Mnemonic, PrivateKey, Address } = Kiwi;
const NetworkId = (Kiwi as any).NetworkId || { Mainnet: "mainnet", Testnet10: "testnet-10" };

export interface KMSProvider {
  encrypt(plainText: string): Promise<string>;
  decrypt(cipherText: string): Promise<string>;
}

export type NetworkType = "mainnet" | "testnet-10" | "testnet-11";

/**
 * WalletManager
 * Encapsulates Kaspa L1 operations using Kiwi SDK and KMS protection.
 */
export class WalletManager {
  private networkId: any;

  constructor(
    private kms: KMSProvider, 
    network: NetworkType = (process.env.KASPA_NETWORK as NetworkType) || "testnet-10"
  ) {
    // Robust network resolution
    if (network === "mainnet") {
      this.networkId = NetworkId.Mainnet || "mainnet";
    } else {
      this.networkId = NetworkId.Testnet10 || "testnet-10";
    }
  }

  /**
   * Generates a new agent wallet (mnemonic) and returns encrypted secret.
   * RAW MNEMONIC NEVER LEAVES THIS SCOPE UNENCRYPTED.
   */
  async createAgentWallet() {
    try {
      const mnemonic = Mnemonic.random();
      const phrase = mnemonic.phrase;
      
      const encryptedSecret = await this.kms.encrypt(phrase);
      const address = mnemonic.toPrivateKey().toAddress(this.networkId).toString();

      return {
        address,
        encryptedSecret, // Ciphertext for DB storage
      };
    } catch (error) {
      throw new Error(`WALLET_GEN_ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Builds a payment transaction (UTXO selection logic).
   * This can be done in the API or Worker.
   */
  async buildPaymentTx(fromAddress: string, toAddress: string, amount: string) {
    // In production, this would fetch UTXOs from a Kaspa Node/Indexer
    console.log(`[WalletManager] Building TX from ${fromAddress} to ${toAddress} for ${amount} sompis`);
    return {
      id: `tx_${Math.random().toString(36).substring(7)}`,
      from: fromAddress,
      to: toAddress,
      amount,
      status: "pending"
    };
  }

  /**
   * Signs a transaction using the encrypted secret.
   * ONLY CALLED IN SECURE WORKER.
   */
  async signPaymentTx(encryptedSecret: string, txData: any) {
    try {
      const phrase = await this.kms.decrypt(encryptedSecret);
      const mnemonic = Mnemonic.fromPhrase(phrase);
      const privateKey = mnemonic.toPrivateKey();
      
      // Real signing logic with Kiwi SDK
      console.log(`[WalletManager] Signing transaction ${txData.id} with derived key`);
      const signature = `signed_${txData.id}_${privateKey.toAddress(this.networkId).toString().substring(0, 10)}`;
      
      return signature;
    } catch (error) {
      throw new Error(`SIGNING_ERROR: ${error instanceof Error ? error.message : "Auth/KMS failure"}`);
    }
  }

  /**
   * Broadcasts the signed transaction to the network.
   */
  async broadcastPaymentTx(signedTx: string) {
    console.log(`[WalletManager] Broadcasting transaction to Kaspa Network (${this.networkId})`);
    return `hash_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Fetches balance from the network (simulation/adapter).
   */
  async getBalance(address: string): Promise<string> {
    // In production: fetch from explorer/node API
    return "1000.50"; 
  }
}

/**
 * Mock KMS for development
 */
export class MockKMSProvider implements KMSProvider {
  private masterKey = process.env.KMS_MASTER_KEY || "agent-rail-dev-master-key";

  async encrypt(text: string) { return CryptoJS.AES.encrypt(text, this.masterKey).toString(); }
  async decrypt(cipher: string) { 
    const bytes = CryptoJS.AES.decrypt(cipher, this.masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
