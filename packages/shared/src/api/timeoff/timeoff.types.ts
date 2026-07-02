import type { recurrenceDomain } from './value-objects/recurrence.standard.vo';

// ______Requests____________________
export interface SaveTimeoffInput {
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  recurrence?: recurrenceDomain;
}

export interface EditTimeoffInput {
  id: string;
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTIme?: string;
  recurrence?: recurrenceDomain;
}

// --- Responses ---

export interface SaveTimeoffResponse {
  message: 'success';
}
export interface EditTImeoffResponse {
  message: 'success';
}
