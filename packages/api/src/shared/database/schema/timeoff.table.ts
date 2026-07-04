import { Insertable, Selectable, Updateable } from 'kysely';
import { AuditFields } from './audit.table';

export interface TimeOffTable extends AuditFields {
  id: string;
  title: string;
  user_id: string;
  business_id: string;
  start_date: Date;
  end_date: Date | null;
  start_time: string | null;
  end_time: string | null;
  recurrence: string | null;
}

export type TimeoffTableSelect = Selectable<TimeOffTable>;
export type TimeoffTableInsert = Insertable<TimeOffTable>;
export type TimeoffTableUpdate = Updateable<TimeOffTable>;
