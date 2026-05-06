export class AgentRailError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public requestId?: string,
    public rawResponse?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends AgentRailError {}
export class RateLimitError extends AgentRailError {}
export class ValidationError extends AgentRailError {}
export class PolicyViolationError extends AgentRailError {}
export class InsufficientBudgetError extends AgentRailError {}
export class IdempotencyConflictError extends AgentRailError {}
export class APIConnectionError extends AgentRailError {}
export class APIResponseError extends AgentRailError {}
