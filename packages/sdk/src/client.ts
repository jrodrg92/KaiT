import { HttpClient } from "./http";
import { PaymentsResource } from "./resources/payments";
import { AgentsResource } from "./resources/agents";
import { WalletsResource } from "./resources/wallets";
import { PoliciesResource } from "./resources/policies";
import { EventsResource } from "./resources/events";
import { WebhookUtils } from "./webhooks";
import { IdempotencyUtils } from "./idempotency";

export interface AgentRailOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export class AgentRail {
  private http: HttpClient;

  public payments: PaymentsResource;
  public agents: AgentsResource;
  public wallets: WalletsResource;
  public policies: PoliciesResource;
  public events: EventsResource;

  constructor(options: AgentRailOptions) {
    this.http = new HttpClient({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl || "https://api.agentrail.io/v1",
      timeout: options.timeout,
      maxRetries: options.maxRetries,
    });

    this.payments = new PaymentsResource(this.http);
    this.agents = new AgentsResource(this.http);
    this.wallets = new WalletsResource(this.http);
    this.policies = new PoliciesResource(this.http);
    this.events = new EventsResource(this.http);
  }

  /**
   * WEBHOOK UTILS
   */
  public get webhooks() {
    return {
      verifySignature: WebhookUtils.verifySignature,
    };
  }

  /**
   * IDEMPOTENCY UTILS
   */
  public get idempotency() {
    return {
      generate: IdempotencyUtils.generate,
    };
  }
}

// Export errors for developers to use in catch blocks
export * from "./errors";
export * from "./types";
