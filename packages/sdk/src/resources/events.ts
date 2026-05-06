import { HttpClient } from "../http";
import { Event, EventSchema, ListOptions, PaginatedResponse } from "../types";

export class EventsResource {
  constructor(private http: HttpClient) {}

  async list(options?: ListOptions & { type?: string; agentId?: string }): Promise<PaginatedResponse<Event>> {
    const response = await this.http.request<PaginatedResponse<any>>("GET", "/events", { 
      query: options as Record<string, string> 
    });
    
    return {
      ...response,
      data: response.data.map(e => EventSchema.parse(e))
    };
  }
}

