// (single) service group --> assign to --> services (multiple)
export interface AssignServiceGroupToServicesEvent {
  serviceGroupId: string;
  serviceIds: string[];
  businessId: string;
  assignedBy: string;
}
