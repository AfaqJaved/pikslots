interface TimeoffCommand {
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  recurrence: string | null;
}

export type CreateTimeoffCommand = TimeoffCommand;
export type EditTimeoffCommand = TimeoffCommand & { id: string };
