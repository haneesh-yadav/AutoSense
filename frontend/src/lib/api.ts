import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { HistoricalPoint, TripSummary } from '../types/telemetry';

// Point this at the FastAPI backend. Falls back to localhost for local dev.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

export function useHistoricalData(range: '1h' | '24h' | '7d' = '24h') {
  return useQuery<HistoricalPoint[]>({
    queryKey: ['historical', range],
    queryFn: async () => {
      const { data } = await apiClient.get<HistoricalPoint[]>('/api/telemetry/history', {
        params: { range },
      });
      return data;
    },
    // Historical data doesn't need to refetch aggressively; live values
    // come in over the WebSocket instead.
    staleTime: 60_000,
    retry: 1,
  });
}

export function useTripSummaries() {
  return useQuery<TripSummary[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await apiClient.get<TripSummary[]>('/api/trips');
      return data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}
