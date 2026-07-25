import type { InfrastructureError, Result } from '../../shared';
import type { BusinessDetails, Services, TeamMemberDetails } from '../public.booking.page.props';

export interface PublicBookingPageRepository {
  findBusinessDetailsByBusinessSlug(
    businessSlug: string,
  ): Promise<Result<BusinessDetails | null, InfrastructureError>>;
  findAllServiceGroupDetailsByBusinessId(
    businessId: string,
  ): Promise<Result<{ id: string; name: string }[], InfrastructureError>>;
  findAllServiceDetailsByBusinessId(
    businessId: string,
  ): Promise<Result<Services[], InfrastructureError>>;
  findAllServiceGroupAssingmentByBusinessId(
    businessId: string,
  ): Promise<
    Result<{ id: string; serviceId: string; serviceGroupId: string }[], InfrastructureError>
  >;
  findAllTeamMembersByBusinessId(
    businessId: string,
  ): Promise<Result<TeamMemberDetails[], InfrastructureError>>;
  findAllServiceUserAssignmentByBusinessId(
    businessId: string,
  ): Promise<Result<{ id: string; serviceId: string; userId: string }[], InfrastructureError>>;
}

export const IPublicBookingPageRepository = Symbol('IPublicBookingPageRepository');
