import { Service } from '@pikslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  ServiceTableInsert,
  ServiceTableSelect,
} from 'src/shared/database/schema/service.table';

export class ServicePersistenceMapper {
  public persistenceToDomain(row: ServiceTableSelect): Service {
    return Service.reconstitute({
      id: row.id,
      title: row.title,
      description: row.description,
      serviceAvatar: row.service_avatar,
      durationInMins: row.duration_in_mins,
      bufferTimeInMins: row.buffer_time_in_mins,
      cost: row.cost,
      isHiddenFromBookingPage: row.is_hidden_from_booking_page,
      businessId: row.business_id,
      colorCode: row.color_code,
      ...persistenceAuditToDomain(row),
    });
  }

  public domainToPersistence(service: Service): ServiceTableInsert {
    return {
      id: service.id,
      title: service.title,
      description: service.description,
      service_avatar: service.serviceAvatar,
      duration_in_mins: service.durationInMins,
      buffer_time_in_mins: service.bufferTimeInMins,
      cost: service.cost,
      is_hidden_from_booking_page: service.isHiddenFromBookingPage,
      business_id: service.businessId,
      color_code: service.colorCode,
      ...domainAuditToPersistence(service),
    };
  }
}
