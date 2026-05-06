import { randomUUID } from "node:crypto";

export class IdempotencyUtils {
  static generate(): string {
    return randomUUID();
  }
}
