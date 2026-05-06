import { HttpClient } from "../http";
import { Wallet, WalletSchema } from "../types";

export class WalletsResource {
  constructor(private http: HttpClient) {}

  async getByAgent(agentId: string): Promise<Wallet> {
    const response = await this.http.request<any>("GET", `/agents/${agentId}/wallet`);
    return WalletSchema.parse(response);
  }

  async getBalance(agentId: string): Promise<{ balance: string; currency: string }> {
    return await this.http.request<{ balance: string; currency: string }>("GET", `/agents/${agentId}/balance`);
  }
}
