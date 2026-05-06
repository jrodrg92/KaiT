import { HttpClient } from "../http";
import { Agent, AgentSchema, ListOptions, PaginatedResponse } from "../types";

export class AgentsResource {
  constructor(private http: HttpClient) {}

  async list(options?: ListOptions): Promise<PaginatedResponse<Agent>> {
    const response = await this.http.request<PaginatedResponse<any>>("GET", "/agents", { 
      query: options as Record<string, string> 
    });
    
    return {
      ...response,
      data: response.data.map(a => AgentSchema.parse(a))
    };
  }


  async get(id: string): Promise<Agent> {
    const response = await this.http.request<any>("GET", `/agents/${id}`);
    return AgentSchema.parse(response);
  }

  async create(data: { name: string; metadata?: Record<string, any> }): Promise<Agent> {
    const response = await this.http.request<any>("POST", "/agents", { body: data });
    return AgentSchema.parse(response);
  }

  async revoke(id: string): Promise<{ status: "revoked" }> {
    return await this.http.request<{ status: "revoked" }>("POST", `/agents/${id}/revoke`);
  }
}
