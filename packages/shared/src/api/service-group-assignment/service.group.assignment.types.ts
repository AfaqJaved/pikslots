// --- Requests ---

export interface AssignServiceToGroupInput {
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
}

// --- Responses ---

export interface ServiceGroupAssignmentResponse {
  id: string;
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
}

export interface ServiceNameResponse {
  id: string;
  name: string;
}

export type FindServicesByGroupResponse = ServiceNameResponse[];

export interface ServiceGroupNameResponse {
  id: string;
  name: string;
}
