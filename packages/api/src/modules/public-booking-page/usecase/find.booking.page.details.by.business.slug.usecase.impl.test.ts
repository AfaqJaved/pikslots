import { Test, TestingModule } from '@nestjs/testing';
import {
  BusinessDetails,
  InfrastructureError,
  IPublicBookingPageRepository,
  ok,
  err,
  PublicBookingPageDetailsNotFound,
  Services,
  TeamMemberDetails,
} from '@pikslots/domain';
import { FindBookingPageDetailsByBusinessSlugUseCaseImpl } from './find.booking.page.details.by.business.slug.usecase.impl';

// ── Fixture builders ────────────────────────────────────────────────────────

function buildBusiness(
  overrides: Partial<BusinessDetails> = {},
): BusinessDetails {
  return {
    id: 'business-1',
    name: 'Glow Hair Studio',
    slug: 'glow-hair-studio',
    about: 'A full-service hair and beauty studio.',
    ...overrides,
  } as BusinessDetails;
}

function buildService(overrides: Partial<Services> = {}): Services {
  return {
    id: 'service-haircut-1',
    title: 'Haircut',
    description: 'Classic haircut and style.',
    serviceAvatar: 'avatar.png',
    durationInMins: 30,
    bufferTimeInMins: 5,
    cost: 2500,
    isHiddenFromBookingPage: false,
    colorCode: '#FFAA00',
    ...overrides,
  };
}

function buildTeamMember(
  overrides: Partial<TeamMemberDetails> = {},
): TeamMemberDetails {
  return {
    id: 'user-stylist-1',
    name: { firstName: 'Amina', lastName: 'Khan' },
    avatarUrl: null,
    role: 'Standard',
    serviceIds: null,
    ...overrides,
  };
}

describe('FindBookingPageDetailsByBusinessSlugUseCaseImpl', () => {
  let useCase: FindBookingPageDetailsByBusinessSlugUseCaseImpl;
  let repository: {
    findBusinessDetailsByBusinessSlug: jest.Mock;
    findAllServiceDetailsByBusinessId: jest.Mock;
    findAllServiceGroupDetailsByBusinessId: jest.Mock;
    findAllServiceGroupAssingmentByBusinessId: jest.Mock;
    findAllTeamMembersByBusinessId: jest.Mock;
    findAllServiceUserAssignmentByBusinessId: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findBusinessDetailsByBusinessSlug: jest
        .fn()
        .mockResolvedValue(ok(buildBusiness())),
      findAllServiceDetailsByBusinessId: jest
        .fn()
        .mockResolvedValue(ok([buildService()])),
      findAllServiceGroupDetailsByBusinessId: jest
        .fn()
        .mockResolvedValue(ok([])),
      findAllServiceGroupAssingmentByBusinessId: jest
        .fn()
        .mockResolvedValue(ok([])),
      findAllTeamMembersByBusinessId: jest.fn().mockResolvedValue(ok([])),
      findAllServiceUserAssignmentByBusinessId: jest
        .fn()
        .mockResolvedValue(ok([])),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindBookingPageDetailsByBusinessSlugUseCaseImpl,
        { provide: IPublicBookingPageRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindBookingPageDetailsByBusinessSlugUseCaseImpl);
  });

  // ── Business not found ───────────────────────────────────────────────────

  describe('business not found', () => {
    it('returns booking_page_not_found when the slug matches no business', async () => {
      repository.findBusinessDetailsByBusinessSlug.mockResolvedValueOnce(
        ok(null),
      );

      const result = await useCase.execute('nonexistent-slug');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const error = result.error as PublicBookingPageDetailsNotFound;
        expect(error.kind).toBe('booking_page_not_found');
        expect(error.by).toBe('businessSlug');
        expect(error.value).toBe('nonexistent-slug');
      }
    });

    it('does not call any of the follow-up repository methods when the business is not found', async () => {
      repository.findBusinessDetailsByBusinessSlug.mockResolvedValueOnce(
        ok(null),
      );

      await useCase.execute('nonexistent-slug');

      expect(
        repository.findAllServiceDetailsByBusinessId,
      ).not.toHaveBeenCalled();
      expect(
        repository.findAllServiceGroupDetailsByBusinessId,
      ).not.toHaveBeenCalled();
      expect(repository.findAllTeamMembersByBusinessId).not.toHaveBeenCalled();
      expect(
        repository.findAllServiceUserAssignmentByBusinessId,
      ).not.toHaveBeenCalled();
      expect(
        repository.findAllServiceGroupAssingmentByBusinessId,
      ).not.toHaveBeenCalled();
    });
  });

  // ── Repository failure propagation ──────────────────────────────────────

  describe('repository failures', () => {
    it('propagates an InfrastructureError from the business lookup', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find business by slug',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      repository.findBusinessDetailsByBusinessSlug.mockResolvedValueOnce(
        err(infraError),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(infraError);
    });

    it('still calls all four parallel repository methods even though only one fails, and returns the serviceGroup error first per if-order', async () => {
      const serviceGroupError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find service groups by business',
        timestamp: new Date(),
        cause: new Error('sg-fail'),
      };
      const servicesError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find services by business',
        timestamp: new Date(),
        cause: new Error('services-fail'),
      };
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        err(serviceGroupError),
      );
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        err(servicesError),
      );

      const result = await useCase.execute('glow-hair-studio');

      // Promise.all means all four run regardless of individual failure
      expect(
        repository.findAllServiceGroupDetailsByBusinessId,
      ).toHaveBeenCalledTimes(1);
      expect(
        repository.findAllServiceDetailsByBusinessId,
      ).toHaveBeenCalledTimes(1);
      expect(repository.findAllTeamMembersByBusinessId).toHaveBeenCalledTimes(
        1,
      );
      expect(
        repository.findAllServiceUserAssignmentByBusinessId,
      ).toHaveBeenCalledTimes(1);

      // serviceGroupResult is checked first in the if-chain, so its error wins
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(serviceGroupError);
    });

    it('propagates an InfrastructureError from findAllServicesDetailsByBusinessId when service groups succeed', async () => {
      const servicesError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find services by business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        err(servicesError),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(servicesError);
    });

    it('propagates an InfrastructureError from findAllTeamMembersByBusinessId', async () => {
      const teamMembersError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find team members by business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      repository.findAllTeamMembersByBusinessId.mockResolvedValueOnce(
        err(teamMembersError),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(teamMembersError);
    });

    it('propagates an InfrastructureError from findAllServiceUserAssignmentByBusinessId', async () => {
      const assignmentError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find assignments by business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      repository.findAllServiceUserAssignmentByBusinessId.mockResolvedValueOnce(
        err(assignmentError),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(assignmentError);
    });

    it('propagates an InfrastructureError from findAllServiceGroupAssingmentByBusinessId, only reached when groups are non-empty', async () => {
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-hair', name: 'Hair Services' }]),
      );
      const groupAssignmentError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find assignments by business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        err(groupAssignmentError),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(groupAssignmentError);
    });
  });

  // ── No service groups (early-return branch) ─────────────────────────────

  describe('when the business has no service groups', () => {
    it('returns groups: [] and all visible services ungrouped, without calling the group-assignment lookup', async () => {
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([
          buildService({ id: 'service-haircut-1' }),
          buildService({ id: 'service-color-1' }),
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.services.groups).toEqual([]);
        expect(result.value.services.services.map((s) => s.id)).toEqual([
          'service-haircut-1',
          'service-color-1',
        ]);
      }
      expect(
        repository.findAllServiceGroupAssingmentByBusinessId,
      ).not.toHaveBeenCalled();
    });
  });

  // ── Visibility filtering ─────────────────────────────────────────────────

  describe('hidden services', () => {
    it('excludes services with isHiddenFromBookingPage from both the ungrouped list and the response', async () => {
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([
          buildService({
            id: 'service-visible-1',
            isHiddenFromBookingPage: false,
          }),
          buildService({
            id: 'service-hidden-1',
            isHiddenFromBookingPage: true,
          }),
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.services.services.map((s) => s.id);
        expect(ids).toContain('service-visible-1');
        expect(ids).not.toContain('service-hidden-1');
      }
    });
  });

  // ── Grouping logic ───────────────────────────────────────────────────────

  describe('service groups with assignments', () => {
    it('places a service into its assigned group and excludes it from ungrouped services', async () => {
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([buildService({ id: 'service-haircut-1' })]),
      );
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-hair', name: 'Hair Services' }]),
      );
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sga-1',
            serviceId: 'service-haircut-1',
            serviceGroupId: 'sg-hair',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.services.groups).toHaveLength(1);
        expect(result.value.services.groups[0].id).toBe('sg-hair');
        expect(
          result.value.services.groups[0].services.map((s) => s?.id),
        ).toEqual(['service-haircut-1']);
        expect(result.value.services.services).toEqual([]); // no ungrouped left
      }
    });

    it('excludes a group entirely when it has no assignments at all', async () => {
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-empty', name: 'Empty Group' }]),
      );
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        ok([]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.services.groups).toEqual([]);
      }
    });

    it('keeps a service ungrouped when it has no assignment at all', async () => {
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([
          buildService({ id: 'service-haircut-1' }),
          buildService({ id: 'service-color-1' }),
        ]),
      );
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-hair', name: 'Hair Services' }]),
      );
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sga-1',
            serviceId: 'service-haircut-1',
            serviceGroupId: 'sg-hair',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.services.services.map((s) => s.id)).toEqual([
          'service-color-1',
        ]);
      }
    });

    it("BUG: includes a literal undefined entry in a group's services when the assignment references a hidden service", async () => {
      // service-hidden-1 is hidden from the booking page, so it's excluded
      // from `serviceById` — but the assignment for it is still present
      // (findAllServiceGroupAssingmentByBusinessId has no visibility filter),
      // so `services.map(id => serviceById[id])` produces `undefined` here.
      // This is locked in as current (buggy) behavior, not asserted as correct.
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([
          buildService({
            id: 'service-hidden-1',
            isHiddenFromBookingPage: true,
          }),
        ]),
      );
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-hair', name: 'Hair Services' }]),
      );
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sga-1',
            serviceId: 'service-hidden-1',
            serviceGroupId: 'sg-hair',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // The group is NOT filtered out, because `[undefined].length > 0`.
        expect(result.value.services.groups).toHaveLength(1);
        expect(result.value.services.groups[0].services).toContain(undefined);
      }
    });

    it('BUG: includes undefined when the assignment references a soft-deleted service (no is_deleted filter on the assignment table)', async () => {
      // findAllServiceDetailsByBusinessId already excludes soft-deleted
      // services, so a lingering assignment row pointing at one produces
      // the same undefined-entry bug as the hidden-service case above.
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([]), // the soft-deleted service never comes back from this call
      );
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-hair', name: 'Hair Services' }]),
      );
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sga-stale',
            serviceId: 'service-soft-deleted-1',
            serviceGroupId: 'sg-hair',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.services.groups).toHaveLength(1);
        expect(result.value.services.groups[0].services).toContain(undefined);
      }
    });
  });

  // ── Team member serviceIds assignment ────────────────────────────────────

  describe('team member service assignment', () => {
    it('populates serviceIds on a team member from serviceUserAssignment when initially null', async () => {
      repository.findAllTeamMembersByBusinessId.mockResolvedValueOnce(
        ok([buildTeamMember({ id: 'user-stylist-1', serviceIds: null })]),
      );
      repository.findAllServiceUserAssignmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sua-1',
            serviceId: 'service-haircut-1',
            userId: 'user-stylist-1',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const member = result.value.teamMembers.find(
          (m) => m.id === 'user-stylist-1',
        );
        expect(member?.serviceIds).toEqual(['service-haircut-1']);
      }
    });

    it('appends multiple assigned serviceIds for the same team member', async () => {
      repository.findAllTeamMembersByBusinessId.mockResolvedValueOnce(
        ok([buildTeamMember({ id: 'user-stylist-1', serviceIds: null })]),
      );
      repository.findAllServiceUserAssignmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sua-1',
            serviceId: 'service-haircut-1',
            userId: 'user-stylist-1',
          },
          {
            id: 'sua-2',
            serviceId: 'service-color-1',
            userId: 'user-stylist-1',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const member = result.value.teamMembers.find(
          (m) => m.id === 'user-stylist-1',
        );
        expect(member?.serviceIds).toEqual([
          'service-haircut-1',
          'service-color-1',
        ]);
      }
    });

    it('silently ignores an assignment referencing a userId not present in the team members list', async () => {
      repository.findAllTeamMembersByBusinessId.mockResolvedValueOnce(
        ok([buildTeamMember({ id: 'user-stylist-1', serviceIds: null })]),
      );
      repository.findAllServiceUserAssignmentByBusinessId.mockResolvedValueOnce(
        ok([
          { id: 'sua-1', serviceId: 'service-haircut-1', userId: 'user-ghost' },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const member = result.value.teamMembers.find(
          (m) => m.id === 'user-stylist-1',
        );
        expect(member?.serviceIds).toBeNull();
      }
    });

    it('DESIGN QUESTION: duplicates a serviceId if the team member already has it and an assignment also references it', async () => {
      // Locked in as current behavior — flagged for confirmation on whether
      // findAllTeamMembersByBusinessId can ever return non-null serviceIds
      // independent of this assignment loop, and if so whether de-duping
      // is expected.
      repository.findAllTeamMembersByBusinessId.mockResolvedValueOnce(
        ok([
          buildTeamMember({
            id: 'user-stylist-1',
            serviceIds: ['service-haircut-1'],
          }),
        ]),
      );
      repository.findAllServiceUserAssignmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sua-1',
            serviceId: 'service-haircut-1',
            userId: 'user-stylist-1',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const member = result.value.teamMembers.find(
          (m) => m.id === 'user-stylist-1',
        );
        expect(member?.serviceIds).toEqual([
          'service-haircut-1',
          'service-haircut-1',
        ]);
      }
    });
  });

  // ── Repository interaction ───────────────────────────────────────────────

  describe('repository interaction', () => {
    it('calls findBusinessDetailsByBusinessSlug with the given slug', async () => {
      await useCase.execute('glow-hair-studio');

      expect(repository.findBusinessDetailsByBusinessSlug).toHaveBeenCalledWith(
        'glow-hair-studio',
      );
    });

    it('calls the four parallel lookups with the resolved businessId, not the slug', async () => {
      repository.findBusinessDetailsByBusinessSlug.mockResolvedValueOnce(
        ok(buildBusiness({ id: 'business-42', slug: 'glow-hair-studio' })),
      );

      await useCase.execute('glow-hair-studio');

      expect(repository.findAllServiceDetailsByBusinessId).toHaveBeenCalledWith(
        'business-42',
      );
      expect(
        repository.findAllServiceGroupDetailsByBusinessId,
      ).toHaveBeenCalledWith('business-42');
      expect(repository.findAllTeamMembersByBusinessId).toHaveBeenCalledWith(
        'business-42',
      );
      expect(
        repository.findAllServiceUserAssignmentByBusinessId,
      ).toHaveBeenCalledWith('business-42');
    });
  });

  // ── Full successful response shape ───────────────────────────────────────

  describe('successful response', () => {
    it('returns the business, grouped services, ungrouped services, and team members together', async () => {
      const business = buildBusiness({ id: 'business-1' });
      repository.findBusinessDetailsByBusinessSlug.mockResolvedValueOnce(
        ok(business),
      );
      repository.findAllServiceDetailsByBusinessId.mockResolvedValueOnce(
        ok([
          buildService({ id: 'service-haircut-1' }),
          buildService({ id: 'service-massage-1' }),
        ]),
      );
      repository.findAllServiceGroupDetailsByBusinessId.mockResolvedValueOnce(
        ok([{ id: 'sg-hair', name: 'Hair Services' }]),
      );
      repository.findAllServiceGroupAssingmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sga-1',
            serviceId: 'service-haircut-1',
            serviceGroupId: 'sg-hair',
          },
        ]),
      );
      repository.findAllTeamMembersByBusinessId.mockResolvedValueOnce(
        ok([buildTeamMember({ id: 'user-stylist-1', serviceIds: null })]),
      );
      repository.findAllServiceUserAssignmentByBusinessId.mockResolvedValueOnce(
        ok([
          {
            id: 'sua-1',
            serviceId: 'service-haircut-1',
            userId: 'user-stylist-1',
          },
        ]),
      );

      const result = await useCase.execute('glow-hair-studio');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.business).toBe(business);
        expect(result.value.services.groups).toHaveLength(1);
        expect(result.value.services.groups[0].name).toBe('Hair Services');
        expect(result.value.services.services.map((s) => s.id)).toEqual([
          'service-massage-1',
        ]);
        expect(result.value.teamMembers[0].serviceIds).toEqual([
          'service-haircut-1',
        ]);
      }
    });
  });
});
