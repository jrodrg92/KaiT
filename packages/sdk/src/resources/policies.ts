import { HttpClient } from "../http";
import { Policy, PolicySchema } from "../types";

export class PoliciesResource {
  constructor(private http: HttpClient) {}

  async getByAgent(agentId: string): Promise<Policy> {
    const response = await this.http.request<any>("GET", `/agents/${agentId}/policy`);
    return PolicySchema.parse(response);
  }

  async update(agentId: string, data: Partial<Omit<Policy, "id" | "agentId" | "createdAt">>): Promise<Policy> {
    const response = await this.http.request<any>("PATCH", `/agents/${agentId}/policy`, { body: data });
    return PolicySchema.parse(response);
  }
}
