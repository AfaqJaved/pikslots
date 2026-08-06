import request from 'supertest';
import { PUBLIC_BOOKING_PAGE_ENDPOINTS } from '@pikslots/shared';

import { endpointFor } from '../common/endpoint-path';
import { successBody, errorBody } from '../common/http-envelope';
import { setupPublicBookingPageTestContext } from './support/public-booking-page-test-context';
import {
  createBusiness,
  createTeamMember,
  registerService,
  registerServiceGroup,
  waitForActiveServiceGroupAssignmentCount,
  waitForActiveServiceUserAssignmentCount,
} from './support/public-booking-page-fixtures';

interface PublicServiceView {
  id: string;
  title: string;
}

interface PublicGroupView {
  id: string;
  name: string;
  services: (PublicServiceView | undefined)[];
}

interface PublicBookingPageView {
  business: { id: string; slug: string };
  services: { groups: PublicGroupView[]; services: PublicServiceView[] };
  teamMembers: { id: string; serviceIds: string[] | null }[];
}

function path(slug: string): string {
  return endpointFor(
    PUBLIC_BOOKING_PAGE_ENDPOINTS.GET_PUBLIC_BOOKING_PAGE_DETAILS,
    { businessSlug: slug },
  );
}

describe(`GET ${PUBLIC_BOOKING_PAGE_ENDPOINTS.GET_PUBLIC_BOOKING_PAGE_DETAILS}`, () => {
  const ctx = setupPublicBookingPageTestContext();

  it('returns 404 for a business slug that does not exist', async () => {
    const response = await request(ctx.app.getHttpServer())
      .get(path('no-such-business-slug'))
      .expect(404);

    expect(errorBody(response).statusCode).toBe(404);
  });

  it('requires no auth token — this is a public, unauthenticated endpoint', async () => {
    const { slug } = await createBusiness(ctx);

    await request(ctx.app.getHttpServer()).get(path(slug)).expect(200);
  });

  it('lists visible, ungrouped services and excludes hidden ones', async () => {
    const { id: businessId, slug } = await createBusiness(ctx);
    await registerService(ctx, businessId, { title: 'Visible Cut' });
    await registerService(ctx, businessId, {
      title: 'Hidden Cut',
      isHiddenFromBookingPage: true,
    });

    const response = await request(ctx.app.getHttpServer())
      .get(path(slug))
      .expect(200);

    const body = successBody<PublicBookingPageView>(response).data;
    expect(body.services.groups).toEqual([]);
    expect(body.services.services.map((s) => s.title)).toEqual(['Visible Cut']);
  });

  it('returns a group with its assigned (visible) services', async () => {
    const { id: businessId, slug } = await createBusiness(ctx);
    const service = await registerService(ctx, businessId, {
      title: 'Color Treatment',
    });
    const group = await registerServiceGroup(ctx, businessId, {
      name: 'Color Services',
      associatedServices: [service.id],
    });
    await waitForActiveServiceGroupAssignmentCount(ctx, group.id, 1);

    const response = await request(ctx.app.getHttpServer())
      .get(path(slug))
      .expect(200);

    const body = successBody<PublicBookingPageView>(response).data;
    expect(body.services.groups).toHaveLength(1);
    expect(body.services.groups[0]).toMatchObject({
      id: group.id,
      name: group.name,
    });
    expect(body.services.groups[0].services.map((s) => s?.title)).toEqual([
      'Color Treatment',
    ]);
    // the grouped service should not also appear in the ungrouped list
    expect(body.services.services).toEqual([]);
  });

  it('excludes a group entirely once it has no services left assigned', async () => {
    const { id: businessId, slug } = await createBusiness(ctx);
    const empty = await registerServiceGroup(ctx, businessId, {
      name: 'Empty Group',
    });

    const response = await request(ctx.app.getHttpServer())
      .get(path(slug))
      .expect(200);

    const body = successBody<PublicBookingPageView>(response).data;
    expect(body.services.groups.find((g) => g.id === empty.id)).toBeUndefined();
  });

  it("populates a team member's serviceIds from the real service-user sync worker", async () => {
    const { id: businessId, slug } = await createBusiness(ctx);
    const stylistId = await createTeamMember(ctx, businessId, 'Standard');
    const service = await registerService(ctx, businessId, {
      associatedUsers: [stylistId],
    });
    await waitForActiveServiceUserAssignmentCount(ctx, service.id, 1);

    const response = await request(ctx.app.getHttpServer())
      .get(path(slug))
      .expect(200);

    const body = successBody<PublicBookingPageView>(response).data;
    const stylist = body.teamMembers.find((m) => m.id === stylistId);
    expect(stylist?.serviceIds).toEqual([service.id]);
  });

  it("excludes a hidden service from its group's service list, rather than leaving a gap", async () => {
    const { id: businessId, slug } = await createBusiness(ctx);
    const visible = await registerService(ctx, businessId, {
      title: 'Visible Style',
    });
    const hidden = await registerService(ctx, businessId, {
      title: 'Hidden Style',
      isHiddenFromBookingPage: true,
    });
    const group = await registerServiceGroup(ctx, businessId, {
      name: 'Style Services',
      associatedServices: [visible.id, hidden.id],
    });
    await waitForActiveServiceGroupAssignmentCount(ctx, group.id, 2);

    const response = await request(ctx.app.getHttpServer())
      .get(path(slug))
      .expect(200);

    const body = successBody<PublicBookingPageView>(response).data;
    const returnedGroup = body.services.groups.find((g) => g.id === group.id);
    expect(returnedGroup?.services).toEqual([
      expect.objectContaining({ id: visible.id, title: 'Visible Style' }),
    ]);
    expect(returnedGroup?.services).not.toContain(undefined);
  });
});
