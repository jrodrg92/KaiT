import { 
  AgentRailError, 
  AuthenticationError, 
  RateLimitError, 
  ValidationError, 
  PolicyViolationError, 
  InsufficientBudgetError, 
  IdempotencyConflictError, 
  APIConnectionError, 
  APIResponseError 
} from "./errors";

export interface HttpClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
}

export class HttpClient {
  constructor(private config: HttpClientConfig) {}

  async request<T>(
    method: string,
    path: string,
    options: { body?: any; params?: Record<string, string>; headers?: Record<string, string> } = {}
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (options.params) {
      Object.entries(options.params).forEach(([key, val]) => url.searchParams.append(key, val));
    }

    const headers = {
      "Authorization": `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "AgentRail-NodeSDK/2.0.0",
      ...options.headers,
    };

    let attempt = 0;
    const maxRetries = this.config.maxRetries ?? 3;

    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout ?? 15000);

        const response = await fetch(url.toString(), {
          method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return (await response.json()) as T;
        }

        const errorData = await response.json().catch(() => ({}));
        const statusCode = response.status;
        const requestId = response.headers.get("x-request-id") || undefined;

        if (this.shouldRetry(statusCode) && attempt < maxRetries) {
          attempt++;
          await this.wait(attempt);
          continue;
        }

        throw this.handleError(statusCode, errorData, requestId);
      } catch (error: any) {
        if (error.name === "AbortError") {
          throw new APIConnectionError("Request timed out", 408);
        }
        if (error instanceof AgentRailError) {
          throw error;
        }
        throw new APIConnectionError(error.message || "Network error", 0);
      }
    }

    throw new APIConnectionError("Max retries exceeded", 0);
  }

  private shouldRetry(statusCode: number): boolean {
    return [429, 500, 502, 503].includes(statusCode);
  }

  private async wait(attempt: number) {
    const delay = Math.pow(2, attempt) * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private handleError(statusCode: number, data: any, requestId?: string): Error {
    const message = data.error || data.message || "Unknown API Error";

    switch (statusCode) {
      case 401: return new AuthenticationError(message, statusCode, requestId, data);
      case 429: return new RateLimitError(message, statusCode, requestId, data);
      case 400: 
        if (message.includes("idempotency")) return new IdempotencyConflictError(message, statusCode, requestId, data);
        return new ValidationError(message, statusCode, requestId, data);
      case 403:
        if (message.includes("budget")) return new InsufficientBudgetError(message, statusCode, requestId, data);
        if (message.includes("policy")) return new PolicyViolationError(message, statusCode, requestId, data);
        return new AgentRailError(message, statusCode, requestId, data);
      default:
        return new APIResponseError(message, statusCode, requestId, data);
    }
  }
}
