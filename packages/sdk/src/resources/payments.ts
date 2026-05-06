import { HttpClient } from "../http";
import { Transaction, TransactionSchema, ListOptions, PaginatedResponse } from "../types";

export class PaymentsResource {
  constructor(private http: HttpClient) {}

  /**
   * Creates a new autonomous payment.
   */
  async create(data: {
    agentId: string;
    toAddress: string;
    amount: string;
    idempotencyKey: string;
    metadata?: Record<string, any>;
  }): Promise<Transaction> {
    const response = await this.http.request<any>("POST", "/payments", { body: data });
    return TransactionSchema.parse(response);
  }

  /**
   * Retrieves a specific payment by ID.
   */
  async get(id: string): Promise<Transaction> {
    const response = await this.http.request<any>("GET", `/transactions/${id}`);
    return TransactionSchema.parse(response);
  }

  /**
   * Lists payments with real pagination and filtering.
   */
  async list(options?: ListOptions & { agentId?: string }): Promise<PaginatedResponse<Transaction>> {
    const response = await this.http.request<PaginatedResponse<any>>("GET", "/transactions", { 
      query: options as Record<string, string> 
    });
    
    return {
      ...response,
      data: response.data.map(tx => TransactionSchema.parse(tx))
    };
  }
}

}
