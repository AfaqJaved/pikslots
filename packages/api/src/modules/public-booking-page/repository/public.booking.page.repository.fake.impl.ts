import {
  BusinessDetails,
  InfrastructureError,
  ok,
  PublicBookingPageRepository,
  Result,
  Services,
  TeamMemberDetails,
} from '@pikslots/domain';
import {
  PUBLIC_BOOKING_PAGE_BUSINESS_TEST_DATA,
  PUBLIC_BOOKING_PAGE_SERVICES_TEST_DATA,
  PUBLIC_BOOKING_PAGE_SERVICE_GROUPS_TEST_DATA,
  PUBLIC_BOOKING_PAGE_SERVICE_GROUP_ASSIGNMENTS_TEST_DATA,
  PUBLIC_BOOKING_PAGE_TEAM_MEMBERS_TEST_DATA,
  PUBLIC_BOOKING_PAGE_SERVICE_USER_ASSIGNMENTS_TEST_DATA,
} from './public.booking.page.test.data';

export class PublicBookingPageRepositoryTestImpl implements PublicBookingPageRepository {
  constructor(
    private readonly businesses = PUBLIC_BOOKING_PAGE_BUSINESS_TEST_DATA,
    private readonly services = PUBLIC_BOOKING_PAGE_SERVICES_TEST_DATA,
    private readonly serviceGroups = PUBLIC_BOOKING_PAGE_SERVICE_GROUPS_TEST_DATA,
    private readonly serviceGroupAssignments = PUBLIC_BOOKING_PAGE_SERVICE_GROUP_ASSIGNMENTS_TEST_DATA,
    private readonly teamMembers = PUBLIC_BOOKING_PAGE_TEAM_MEMBERS_TEST_DATA,
    private readonly serviceUserAssignments = PUBLIC_BOOKING_PAGE_SERVICE_USER_ASSIGNMENTS_TEST_DATA,
  ) {}

  async findBusinessDetailsByBusinessSlug(
    businessSlug: string,
  ): Promise<Result<BusinessDetails | null, InfrastructureError>> {
    await Promise.resolve('');
    const found = this.businesses.find(
      (b) => b.slug === businessSlug && !b.isDeleted,
    );

    if (!found) return ok(null);

    const { isDeleted, ...businessDetails } = found;
    return ok(businessDetails);
  }

  async findAllServiceDetailsByBusinessId(
    businessId: string,
  ): Promise<Result<Services[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      this.services
        .filter((s) => s.businessId === businessId && !s.isDeleted)
        .map(({ businessId: _b, isDeleted: _d, ...service }) => service),
    );
  }

  async findAllServiceGroupDetailsByBusinessId(
    businessId: string,
  ): Promise<Result<{ id: string; name: string }[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      this.serviceGroups
        .filter((g) => g.businessId === businessId && !g.isDeleted)
        .map(({ id, name }) => ({ id, name })),
    );
  }

  async findAllServiceGroupAssingmentByBusinessId(
    businessId: string,
  ): Promise<
    Result<
      { id: string; serviceId: string; serviceGroupId: string }[],
      InfrastructureError
    >
  > {
    await Promise.resolve('');
    return ok(
      this.serviceGroupAssignments
        .filter((a) => a.businessId === businessId)
        .map(({ id, serviceId, serviceGroupId }) => ({
          id,
          serviceId,
          serviceGroupId,
        })),
    );
  }

  async findAllTeamMembersByBusinessId(
    businessId: string,
  ): Promise<Result<TeamMemberDetails[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      this.teamMembers
        .filter((m) => m.businessId === businessId && !m.isDeleted)
        .map(({ businessId: _b, isDeleted: _d, ...member }) => member),
    );
  }

  async findAllServiceUserAssignmentByBusinessId(
    businessId: string,
  ): Promise<
    Result<
      { id: string; serviceId: string; userId: string }[],
      InfrastructureError
    >
  > {
    await Promise.resolve('');
    return ok(
      this.serviceUserAssignments
        .filter((a) => a.businessId === businessId)
        .map(({ id, serviceId, userId }) => ({ id, serviceId, userId })),
    );
  }
}
