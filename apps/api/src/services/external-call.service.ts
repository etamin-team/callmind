import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "../config/environment.js";

const REFERENCE_CALL_API_BASE_URL = "http://89.126.208.106:3000";

// Types for external API
export interface VoiceConfig {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface StartCallRequest {
  phone: string;
  prompt: string;
  greetingPrompt?: string;
  maxDuration?: number;
  goodbyeMessage?: string;
  refusalPhrases?: string[];
  webhookUrl?: string;
  voiceConfig?: VoiceConfig;
}

export interface StartCallResponse {
  success: boolean;
  callSid: string;
}

export interface LiveCallStatus {
  callSid: string;
  phone: string;
  status: "idle" | "user_speaking" | "processing" | "ai_speaking";
  turnCount: number;
  durationSeconds: number;
  transcript: Array<{
    role: "assistant" | "user";
    content: string;
    timestamp: string;
  }>;
}

export interface CallResult {
  id: number;
  call_sid: string;
  phone: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  outcome:
    | "sold"
    | "interested"
    | "refused"
    | "no_answer"
    | "busy"
    | "timeout"
    | "completed";
  created_at: string;
  transcript: Array<{
    role: "assistant" | "user";
    content: string;
    ts: string;
  }>;
}

export interface RecentCallsResponse {
  count: number;
  calls: Array<{
    call_sid: string;
    phone: string;
    outcome: string;
    duration_seconds: number;
    started_at: string;
  }>;
}

export interface StartCampaignRequest {
  phones: string[];
  prompt: string;
  greetingPrompt?: string;
  maxDuration?: number;
  goodbyeMessage?: string;
  refusalPhrases?: string[];
  concurrency?: number;
  delayBetweenMs?: number;
  webhookUrl?: string;
  voiceConfig?: VoiceConfig;
}

export interface StartCampaignResponse {
  success: boolean;
  campaignId: string;
  total: number;
  concurrency: number;
}

export interface Campaign {
  campaignId: string;
  status: "running" | "paused" | "completed" | "cancelled";
  total: number;
  completed: number;
  remaining: number;
  active: number;
  createdAt: string;
  finishedAt: string | null;
  results?: Array<{
    phone: string;
    callSid: string;
    outcome: string;
    durationSeconds: number;
  }>;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
}

export interface ScheduleCallRequest {
  type?: "call";
  runAt: string;
  phone: string;
  prompt: string;
  greetingPrompt?: string;
  maxDuration?: number;
  goodbyeMessage?: string;
  refusalPhrases?: string[];
  voiceConfig?: VoiceConfig;
}

export interface ScheduleCampaignRequest {
  type: "campaign";
  runAt: string;
  phones: string[];
  prompt: string;
  greetingPrompt?: string;
  maxDuration?: number;
  goodbyeMessage?: string;
  refusalPhrases?: string[];
  concurrency?: number;
  delayBetweenMs?: number;
  voiceConfig?: VoiceConfig;
}

export type ScheduleRequest = ScheduleCallRequest | ScheduleCampaignRequest;

export interface ScheduleResponse {
  success: boolean;
  scheduleId: string;
  type: "call" | "campaign";
  runAt: string;
  delaySeconds: number;
}

export interface ScheduledItem {
  scheduleId: string;
  type: "single_call" | "campaign";
  phone?: string;
  runAt: string;
  status: "pending";
  createdAt: string;
}

export interface SchedulesListResponse {
  scheduled: ScheduledItem[];
}

export interface HealthResponse {
  status: string;
  activeCalls: number;
  maxConcurrent: number;
  asterisk: boolean;
  database: { healthy: boolean };
  uptime: number;
}

export interface DeepHealthResponse {
  status: string;
  services: {
    asterisk: { healthy: boolean };
    database: { healthy: boolean };
    gemini: { healthy: boolean };
    elevenlabs: { healthy: boolean };
    muxlisa_stt: { healthy: boolean };
  };
}

class ExternalCallService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = config.CALL_API_BASE_URL || REFERENCE_CALL_API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request/response logging in development
    if (config.NODE_ENV === "development") {
      this.client.interceptors.request.use((request) => {
        console.log(
          `[External API] ${request.method?.toUpperCase()} ${request.url}`,
        );
        return request;
      });

      this.client.interceptors.response.use(
        (response) => {
          console.log(
            `[External API] ${response.status} ${response.config.url}`,
          );
          return response;
        },
        (error: AxiosError) => {
          console.error(
            `[External API Error] ${error.message}`,
            error.response?.data,
          );
          return Promise.reject(error);
        },
      );
    }
  }

  private createClient(baseURL: string) {
    return axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private shouldRetryWithReference(error: unknown) {
    if (!(error instanceof AxiosError)) {
      return false;
    }

    const message =
      typeof error.response?.data === "object" && error.response?.data
        ? String((error.response.data as any).message || "")
        : "";

    return (
      error.response?.status === 404 &&
      message.includes("Route") &&
      this.baseURL !== REFERENCE_CALL_API_BASE_URL
    );
  }

  private async withReferenceFallback<T>(
    request: (client: AxiosInstance) => Promise<T>,
  ): Promise<T> {
    try {
      return await request(this.client);
    } catch (error) {
      if (!this.shouldRetryWithReference(error)) {
        throw error;
      }

      const fallbackClient = this.createClient(REFERENCE_CALL_API_BASE_URL);
      return request(fallbackClient);
    }
  }

  // ==================== Call Endpoints ====================

  async startCall(data: StartCallRequest): Promise<StartCallResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.post<StartCallResponse>("/call", data),
    );
    return response.data;
  }

  async getCallStatus(sid: string): Promise<LiveCallStatus> {
    const response = await this.withReferenceFallback((client) =>
      client.get<LiveCallStatus>(`/call/${sid}`),
    );
    return response.data;
  }

  async hangUpCall(sid: string): Promise<{ success: boolean }> {
    const response = await this.withReferenceFallback((client) =>
      client.delete<{ success: boolean }>(`/call/${sid}`),
    );
    return response.data;
  }

  async getCallResult(sid: string): Promise<CallResult> {
    const response = await this.withReferenceFallback((client) =>
      client.get<CallResult>(`/call/${sid}/result`),
    );
    return response.data;
  }

  async getRecentCalls(limit: number = 50): Promise<RecentCallsResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.get<RecentCallsResponse>(`/calls/recent`, {
        params: { limit: Math.min(limit, 200) },
      }),
    );
    return response.data;
  }

  // ==================== Campaign Endpoints ====================

  async startCampaign(
    data: StartCampaignRequest,
  ): Promise<StartCampaignResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.post<StartCampaignResponse>("/campaign", data),
    );
    return response.data;
  }

  async getCampaigns(): Promise<CampaignListResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.get<CampaignListResponse>("/campaigns"),
    );
    return response.data;
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await this.withReferenceFallback((client) =>
      client.get<Campaign>(`/campaign/${id}`),
    );
    return response.data;
  }

  async pauseCampaign(
    id: string,
  ): Promise<{ success: boolean; status: string }> {
    const response = await this.withReferenceFallback((client) =>
      client.post<{
        success: boolean;
        status: string;
      }>(`/campaign/${id}/pause`),
    );
    return response.data;
  }

  async resumeCampaign(
    id: string,
  ): Promise<{ success: boolean; status: string }> {
    const response = await this.withReferenceFallback((client) =>
      client.post<{
        success: boolean;
        status: string;
      }>(`/campaign/${id}/resume`),
    );
    return response.data;
  }

  async cancelCampaign(
    id: string,
  ): Promise<{ success: boolean; status: string }> {
    const response = await this.withReferenceFallback((client) =>
      client.delete<{
        success: boolean;
        status: string;
      }>(`/campaign/${id}`),
    );
    return response.data;
  }

  // ==================== Schedule Endpoints ====================

  async schedule(data: ScheduleRequest): Promise<ScheduleResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.post<ScheduleResponse>("/schedule", data),
    );
    return response.data;
  }

  async getSchedules(): Promise<SchedulesListResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.get<SchedulesListResponse>("/schedules"),
    );
    return response.data;
  }

  async cancelSchedule(id: string): Promise<{ success: boolean }> {
    const response = await this.withReferenceFallback((client) =>
      client.delete<{ success: boolean }>(`/schedule/${id}`),
    );
    return response.data;
  }

  // ==================== Health Endpoints ====================

  async getHealth(): Promise<HealthResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.get<HealthResponse>("/health"),
    );
    return response.data;
  }

  async getDeepHealth(): Promise<DeepHealthResponse> {
    const response = await this.withReferenceFallback((client) =>
      client.get<DeepHealthResponse>("/health/deep"),
    );
    return response.data;
  }
}

export const externalCallService = new ExternalCallService();
export default externalCallService;
