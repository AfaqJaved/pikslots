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
      startDateTime: row.start_date_time.toISOString(),
      endDateTime: row.end_date_time.toISOString(),
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
      start_date_time: new Date(timeoff.startDateTime),
      end_date_time: new Date(timeoff.endDateTime),
      recurrence: timeoff.recurrence,
      ...domainAuditToPersistence(timeoff),
    };
  }
}
