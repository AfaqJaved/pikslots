import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  FindBookingPageDetailsByBusinessSlugUseCase,
  InfrastructureError,
  IPublicBookingPageRepository,
  ok,
  PublicBookingPage,
  PublicBookingPageDetailsNotFound,
  Result,
} from '@pikslots/domain';
import type { Services, PublicBookingPageRepository } from '@pikslots/domain';

@Injectable()
export class FindBookingPageDetailsByBusinessSlugUseCaseImpl implements FindBookingPageDetailsByBusinessSlugUseCase {
  constructor(
    @Inject(IPublicBookingPageRepository)
    private readonly publicBookingPageRepository: PublicBookingPageRepository,
  ) {}

  async execute(
    businessSlug: string,
  ): Promise<
    Result<
      PublicBookingPage,
      PublicBookingPageDetailsNotFound | InfrastructureError
    >
  > {
    // first find business details
    const businessResult =
      await this.publicBookingPageRepository.findBusinessDetailsByBusinessSlug(
        businessSlug,
      );
    if (!businessResult.ok) return err(businessResult.error);

    const business = businessResult.value;
    if (!business) {
      return err<PublicBookingPageDetailsNotFound>({
        kind: 'booking_page_not_found',
        by: 'businessSlug',
        message: 'Business not found for the given slug',
        timestamp: new Date(),
        value: businessSlug,
      });
    }

    const businessId = business.id;
    // promise.all servicess , servicesGroup ,  User (team Members)
    const [serviceGroupResult, servicesResult, teamMembersResult] =
      await Promise.all([
        this.publicBookingPageRepository.findAllServiceGroupDetailsByBusinessId(
          businessId,
        ),
        this.publicBookingPageRepository.findAllServiceDetailsByBusinessId(
          businessId,
        ),
        this.publicBookingPageRepository.findAllTeamMembersByBusinessId(
          businessId,
        ),
      ]);

    if (!serviceGroupResult.ok) return err(serviceGroupResult.error);
    if (!servicesResult.ok) return err(servicesResult.error);
    if (!teamMembersResult.ok) return err(teamMembersResult.error);

    const teamMembers = teamMembersResult.value;

    const visibleServices = servicesResult.value.filter(
      (s) => !s.isHiddenFromBookingPage,
    );

    // if  serviceGroup is not exist just return servicesGroups
    if (serviceGroupResult.value.length === 0) {
      return ok({
        business,
        services: { groups: [], services: visibleServices },
        teamMembers: teamMembers,
      });
    }

    // if exists get serviceGroupAssignments
    const serviceAssignmentsResult =
      await this.publicBookingPageRepository.findAllServiceGroupAssingmentByBusinessId(
        businessId,
      );
    if (!serviceAssignmentsResult.ok)
      return err(serviceAssignmentsResult.error);

    // using map serviceGroupId --> multipleServicesId one Group have many Services Id
    const assignmentGroupToServiceIds = new Map<string, Set<string>>();
    const assignedServiceIds = new Set<string>();

    for (const assignment of serviceAssignmentsResult.value) {
      if (!assignmentGroupToServiceIds.has(assignment.serviceGroupId)) {
        assignmentGroupToServiceIds.set(assignment.serviceGroupId, new Set());
      }
      assignmentGroupToServiceIds
        .get(assignment.serviceGroupId)!
        .add(assignment.serviceId);
      assignedServiceIds.add(assignment.serviceId);
    }

    // object serivceId ---> Service object
    const serviceById: Record<string, Services> = {};
    for (const service of visibleServices) {
      serviceById[service.id] = service;
    }

    // ungrouped services the services which is not in a group
    const ungroupedServices = visibleServices.filter(
      (s) => !assignedServiceIds.has(s.id),
    );

    const publicServiceGroups = serviceGroupResult.value
      .map((group) => {
        const groupServices = assignmentGroupToServiceIds.get(group.id);
        if (!groupServices) return null;
        const services = [...groupServices].map((id) => serviceById[id]);
        return {
          id: group.id,
          name: group.name,
          services,
        };
      })
      .filter(
        (g): g is NonNullable<typeof g> => g !== null && g.services.length > 0,
      );

    return ok({
      business,
      services: { groups: publicServiceGroups, services: ungroupedServices },
      teamMembers: teamMembers,
    });
  }
}
