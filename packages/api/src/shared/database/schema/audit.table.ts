/** Shared audit columns mixed into every table. */
export interface AuditFields {
  created_at: Date; // when the row was created
  created_by: string; // user id who created the row
  updated_at: Date; // when the row was last updated
  updated_by: string; // user id who last updated the row
  deleted_at: Date | null; // soft-delete timestamp; null means not deleted
  deleted_by: string | null; // user id who soft-deleted the row
  is_deleted: boolean; // soft-delete flag
}
