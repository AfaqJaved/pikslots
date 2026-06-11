// --- Requests ---

export interface RegisterServiceGroupInput {
  name: string;
  businessId: string;
  associatedServices: string[];
}

// --- Responses ---
export interface ServiceGroupResponse {
  id: string;
  name: string;
  businessId: string;
}

export interface RegisterServiceGroupResponse {
  message: 'success';
}
