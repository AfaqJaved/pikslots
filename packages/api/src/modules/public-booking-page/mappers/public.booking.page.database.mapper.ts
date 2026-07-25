import { BusinessDetails, Services, TeamMemberDetails } from '@pikslots/domain';
import { BusinessTableSelect } from 'src/shared/database/schema/business.table';
import { ServiceGroupAssignmentTableSelect } from 'src/shared/database/schema/service.group.assignment.table';
import { ServiceGroupTableSelect } from 'src/shared/database/schema/service.group.table';
import { ServiceTableSelect } from 'src/shared/database/schema/service.table';
import { ServiceUserAssignmentTableSelect } from 'src/shared/database/schema/service.user.assignment.table';
import { UserTableSelect } from 'src/shared/database/schema/user.table';

export class PublicBookingPagePresistenceMapper {
  public businessToDomain(row: BusinessTableSelect): BusinessDetails {
    return {
      id: row.id,
      name: row.name,
      about: row.about,
      slug: row.slug,
      brandDetail: row.brand_detail,
      brandApperanceDetails: row.brand_appearance_details,
      bookingContactFields: row.booking_contact_fields,
      bookingCustomization: row.booking_customization,
      bookingLabelOverrides: row.booking_label_overrides,
      bookingPolicies: row.booking_policies,
      bookingSetup: row.booking_setup,
      businessHours: row.business_hours,
      businessLinks: row.business_links,
      locationDetails: row.location_details,
    };
  }

  public serviceToDomain(row: ServiceTableSelect): Services {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      serviceAvatar: row.service_avatar,
      durationInMins: row.duration_in_mins,
      bufferTimeInMins: row.buffer_time_in_mins,
      cost: row.cost,
      isHiddenFromBookingPage: row.is_hidden_from_booking_page,
      colorCode: row.color_code,
    };
  }

  public serviceGroupToDomain(row: ServiceGroupTableSelect): {
    id: string;
    name: string;
  } {
    return {
      id: row.id,
      name: row.name,
    };
  }

  public serviceGroupAssignmentToDomain(
    row: ServiceGroupAssignmentTableSelect,
  ): {
    id: string;
    serviceId: string;
    serviceGroupId: string;
  } {
    return {
      id: row.id,
      serviceId: row.service_id,
      serviceGroupId: row.service_group_id,
    };
  }

  public userToDomain(row: UserTableSelect): TeamMemberDetails {
    return {
      id: row.id,
      avatarUrl: row.avatar_url,
      name: { firstName: row.first_name, lastName: row.last_name },
      role: row.role,
      serviceIds: null,
    };
  }
  public serviceUserAssignment(row: ServiceUserAssignmentTableSelect): {
    id: string;
    userId: string;
    serviceId: string;
  } {
    return {
      id: row.id,
      userId: row.user_id,
      serviceId: row.service_id,
    };
  }
}
