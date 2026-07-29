import type request from 'supertest';

export type SupertestResponse = request.Response;

export interface SuccessEnvelope<T = unknown> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface ErrorEnvelope {
  message: string;
  statusCode: number;
  timestamp: string;
}

export function successBody<T = unknown>(
  response: SupertestResponse,
): SuccessEnvelope<T> {
  return response.body as SuccessEnvelope<T>;
}

export function errorBody(response: SupertestResponse): ErrorEnvelope {
  return response.body as ErrorEnvelope;
}
