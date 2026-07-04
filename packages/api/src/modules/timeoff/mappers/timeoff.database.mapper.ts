import {
  TimeoffTableInsert,
  TimeoffTableSelect,
} from 'src/shared/database/schema/timeoff.table';
import { Timeoff } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';

export class TimeoffPersistenceMapper {
  public persistenceToDomain(row: TimeoffTableSelect): Timeoff {
    return Timeoff.reconstitute({
      id: row.id,
      title: row.title,
      userId: row.user_id,
      businessId: row.business_id,
      startDate: row.start_date,
      endDate: row.end_date,
      startTime: row.start_time,
      endTime: row.end_time,
      recurrence: row.recurrence,
      ...persistenceAuditToDomain(row),
    });
  }
  public domainToPersistence(timeoff: Timeoff): TimeoffTableInsert {
    return {
      id: timeoff.id,
      title: timeoff.title,
      user_id: timeoff.userId,
      business_id: timeoff.businessId,
      start_date: timeoff.startDate,
      end_date: timeoff.endDate || null,
      start_time: timeoff.startTime || null,
      end_time: timeoff.endTime || null,
      recurrence: timeoff.recurrence,
      ...domainAuditToPersistence(timeoff),
    };
  }
}
