import { Break } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  BreakTableInsert,
  BreakTableSelect,
} from 'src/shared/database/schema/break.table';

export class BreakPersistenceMapper {
  public persistenceToDomain(row: BreakTableSelect): Break {
    return Break.reconstitute({
      id: row.id,
      day: row.day,
      startTime: row.start_time,
      endTime: row.end_time,
      userId: row.user_id,
      businessId: row.business_id,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(breakEntity: Break): BreakTableInsert {
    return {
      id: breakEntity.id,
      day: breakEntity.day,
      start_time: breakEntity.startTime,
      end_time: breakEntity.endTime,
      user_id: breakEntity.userId,
      business_id: breakEntity.businessId,
      ...domainAuditToPersistence(breakEntity),
    };
  }
}
