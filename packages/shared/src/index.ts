// Shared types and utilities across all HyperVault services

export interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  uptime?: number;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}
