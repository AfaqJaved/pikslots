import type { WeekDay } from '../business/types';

// --- Request types ---

export interface CreateBreakRequest {
  day: WeekDay;
  startTime: string;
  endTime: string;
  userId: string;
  businessId: string;
}

export interface UpdateBreakRequest {
  day?: WeekDay;
  startTime?: string;
  endTime?: string;
}

// --- Response types ---

export interface CreateBreakResponse {
  message: 'success';
}

export interface UpdateBreakResponse {
  message: 'success';
}

export interface DeleteBreakResponse {
  message: 'success';
}

export interface BreakItemResponse {
  id: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  userId: string;
  businessId: string;
}

export type FindBreaksByUserResponse = BreakItemResponse[];

export interface FindBreakByIdResponse {
  id: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  userId: string;
  businessId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  isDeleted: boolean;
}
