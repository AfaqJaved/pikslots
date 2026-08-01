import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import type { Kysely } from 'kysely';

import type { PikSlotsDatabase } from '../../../src/shared/database/schema';
import type { JwtLoginService } from '../../../src/shared/security/jwt/jwt.login.service';
import {
  createRealInfraTestApp,
  closeRealInfraTestApp,
} from '../../common/real-infra-test-app';

export interface TimeoffTestContext {
  app: INestApplication<App>;
  db: Kysely<PikSlotsDatabase>;
  jwtLoginService: JwtLoginService;
  sentEmails: jest.Mock;
  /**
   * Unlike Customer (customers.business_id has ON DELETE CASCADE), the
   * timeoffs table's `user_id` and `business_id` FKs were created with no
   * onDelete clause at all (see the timeoff_table migration) -- the default
   * is RESTRICT. Deleting a business or user while a timeoff row still
   * points at it would throw a live FK-violation in afterAll. So timeoffs
   * MUST be deleted first, explicitly, before businesses/users.
   */
  createdTimeoffIds: string[];
  createdBusinessIds: string[];
  createdUserIds: string[];
}

export function setupTimeoffTestContext(): TimeoffTestContext {
  jest.setTimeout(30000);

  const ctx: TimeoffTestContext = {
    createdTimeoffIds: [],
    createdBusinessIds: [],
    createdUserIds: [],
  } as unknown as TimeoffTestContext;

  beforeAll(async () => {
    const infra = await createRealInfraTestApp();
    ctx.app = infra.app;
    ctx.db = infra.db;
    ctx.jwtLoginService = infra.jwtLoginService;
    ctx.sentEmails = infra.sentEmails;
  });

  afterAll(async () => {
    // Same async settle-time cushion as the Business/Customer suites.
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (ctx.createdTimeoffIds.length > 0) {
      // Delete FIRST: timeoffs.user_id / business_id are RESTRICT, not
      // CASCADE, so businesses/users below would fail to delete otherwise.
      await ctx.db
        .deleteFrom('timeoffs')
        .where('id', 'in', ctx.createdTimeoffIds)
        .execute();
    }

    if (ctx.createdBusinessIds.length > 0) {
      await ctx.db
        .deleteFrom('businesses')
        .where('id', 'in', ctx.createdBusinessIds)
        .execute();
    }

    if (ctx.createdUserIds.length > 0) {
      await ctx.db
        .deleteFrom('users')
        .where('id', 'in', ctx.createdUserIds)
        .execute();
    }

    await closeRealInfraTestApp({ app: ctx.app, db: ctx.db });
  });

  beforeEach(() => {
    ctx.sentEmails.mockClear();
  });

  return ctx;
}
