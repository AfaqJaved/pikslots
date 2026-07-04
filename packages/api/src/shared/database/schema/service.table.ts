import { Selectable, Insertable, Updateable } from 'kysely';
import type { AuditFields } from './audit.table';

export interface ServiceTable extends AuditFields {
  id: string; // uuid primary key
  title: string; // unique per business
  description: string;
  images: string[]; // max 5 image URLs
  duration_in_mins: number;
  buffer_time_in_mins: number; // gap between consecutive bookings
  cost: number;
  is_hidden_from_booking_page: boolean;
  business_id: string; // fk → businesses.id
  color_code: string;
}

export type ServiceTableSelect = Selectable<ServiceTable>;
export type ServiceTableInsert = Insertable<ServiceTable>;
export type ServiceTableUpdate = Updateable<ServiceTable>;
