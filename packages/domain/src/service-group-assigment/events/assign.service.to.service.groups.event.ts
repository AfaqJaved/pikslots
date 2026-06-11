// (single) service --> assign to --> service groups (multiple)
export interface AssignServiceToServiceGroupsEvent {
  serviceId: string;
  serviceGroupIds: string[];
  businessId: string;
  assignedBy: string;
}
