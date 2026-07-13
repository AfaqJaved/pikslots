import { Insertable, Selectable, Updateable } from 'kysely';
import { AuditFields } from './audit.table';

export interface TimeOffTable extends AuditFields {
  id: string;
  title: string;
  user_id: string;
  business_id: string;
  start_date_time: Date;
  end_date_time: Date;
  all_day: boolean;
  time_zone: string;
  recurrence: string | null; // rrule string
}

export type TimeoffTableSelect = Selectable<TimeOffTable>;
export type TimeoffTableInsert = Insertable<TimeOffTable>;
export type TimeoffTableUpdate = Updateable<TimeOffTable>;
