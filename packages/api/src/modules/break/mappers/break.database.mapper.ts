import { Break } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import type {
  BreakTableInsert,
  BreakTableSelect,
} from 'src/shared/database/schema/break.table';
export class BreakPersistenceMapper {
  public persistenceToDomain(row: BreakTableSelect): Break {
    return Break.reconstitute({
      id: row.id,
      userId: row.user_id,
      businessId: row.buisnessId,
      day: row.day,
      startTime: row.start_time,
      endTime: row.end_time,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(break_: Break): BreakTableInsert {
    return {
      id: break_.id,
      user_id: break_.userId,
      buisnessId: break_.buisnessId,
      day: break_.day,
      start_time: break_.startTime,
      end_time: break_.endTime,
      ...domainAuditToPersistence(break_),
    };
  }
}
