import type { AuditFields } from '../schema/audit.table';

export interface DomainAuditFields {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy: string | null;
  isDeleted: boolean;
}

/** Maps DB audit columns → domain audit fields (persistence → domain). */
export function persistenceAuditToDomain(row: AuditFields): DomainAuditFields {
  return {
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    deletedAt: row.deleted_at,
    deletedBy: row.deleted_by,
    isDeleted: row.is_deleted,
  };
}

/** Maps domain audit fields → DB audit columns (domain → persistence). */
export function domainAuditToPersistence(
  audit: DomainAuditFields,
): AuditFields {
  return {
    created_at: audit.createdAt,
    created_by: audit.createdBy,
    updated_at: audit.updatedAt,
    updated_by: audit.updatedBy,
    deleted_at: audit.deletedAt,
    deleted_by: audit.deletedBy,
    is_deleted: audit.isDeleted,
  };
}
