// (single) service --> assign to --> users (multiple)
export interface AssignServiceToUsersEvent {
  serviceId: string;
  userIds: string[];
  businessId: string;
  assignedBy: string;
}
