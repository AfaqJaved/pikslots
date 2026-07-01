import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';
import { BreakDay } from '@pikslots/domain';

export interface BreakTable extends AuditFields {
  id: string; // uuid primary key
  user_id: string; // fk → users.id
  buisnessId: string;
  day: BreakDay; // day of the week
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export type BreakTableSelect = Selectable<BreakTable>;
export type BreakTableInsert = Insertable<BreakTable>;
export type BreakTableUpdate = Updateable<BreakTable>;
