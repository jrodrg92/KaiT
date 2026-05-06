import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpClient } from "../src/http";
import { RateLimitError, ValidationError } from "../src/errors";

describe("HttpClient", () => {
  const apiKey = "test_key";
  const baseUrl = "http://api.test";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("should retry on 429", async () => {
    const http = new HttpClient({ apiKey, baseUrl, maxRetries: 1 });
    
    // First attempt: 429
    // Second attempt: 200
    (fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: "Too many requests" }),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: new Map(),
      });

    const result = await http.request("GET", "/test");
    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should NOT retry on 400", async () => {
    const http = new HttpClient({ apiKey, baseUrl, maxRetries: 3 });
    
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad Request" }),
      headers: new Map(),
    });

    await expect(http.request("GET", "/test")).rejects.toThrow(ValidationError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
