// ______Requests____________________
export interface RegisterTimeoffInput {
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  recurrence: string | null;
}

export interface EditTimeoffInput {
  id: string;
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  recurrence: string | null;
}

// --- Responses ---

export interface RegisterTimeoffResponse {
  message: 'success';
}
export interface EditTimeoffResponse {
  message: 'success';
}

export interface FindTimeoffByIdResponse {
  id: string;
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  recurrence: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy: string | null;
  isDeleted: boolean;
}

export type FindAllTimeoffByUserResponse = FindTimeoffByIdResponse[];

export interface DeleteTimeoffResponse {
  message: 'success';
}
