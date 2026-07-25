import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessDetails,
  err,
  InfrastructureError,
  ok,
  PublicBookingPageRepository,
  Result,
  Services,
  TeamMemberDetails,
} from '@pikslots/domain';
import { Kysely } from 'kysely';
import { PIKSLOTS_DB } from 'src/shared/database/pikslots.database.module';
import { PikSlotsDatabase } from 'src/shared/database/schema';
import { PublicBookingPagePresistenceMapper } from '../mappers/public.booking.page.database.mapper';

@Injectable()
export class PublicBookingPageRepositoryImpl implements PublicBookingPageRepository {
  private PesistenceMapper = new PublicBookingPagePresistenceMapper();

  constructor(
    @Inject(PIKSLOTS_DB) private readonly db: Kysely<PikSlotsDatabase>,
  ) {}

  async findBusinessDetailsByBusinessSlug(
    businessSlug: string,
  ): Promise<Result<BusinessDetails | null, InfrastructureError>> {
    try {
      const row = await this.db
        .selectFrom('businesses')
        .selectAll()
        .where('slug', '=', businessSlug)
        .where('is_deleted', '=', false)
        .executeTakeFirst();

      if (!row) return ok(null);
      return ok(this.PesistenceMapper.businessToDomain(row));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find business by slug',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllServiceDetailsByBusinessId(
    businessId: string,
  ): Promise<Result<Services[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('services')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.PesistenceMapper.serviceToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find services by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllServiceGroupDetailsByBusinessId(
    businessId: string,
  ): Promise<Result<{ id: string; name: string }[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('service_groups')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(
        rows.map((row) => this.PesistenceMapper.serviceGroupToDomain(row)),
      );
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service groups by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllServiceGroupAssingmentByBusinessId(
    businessId: string,
  ): Promise<
    Result<
      { id: string; serviceId: string; serviceGroupId: string }[],
      InfrastructureError
    >
  > {
    try {
      const rows = await this.db
        .selectFrom('service_group_assignments')
        .selectAll()
        .where('business_id', '=', businessId)
        .execute();

      return ok(
        rows.map((row) =>
          this.PesistenceMapper.serviceGroupAssignmentToDomain(row),
        ),
      );
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find assignments by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllTeamMembersByBusinessId(
    businessId: string,
  ): Promise<Result<TeamMemberDetails[], InfrastructureError>> {
    try {
      const rows = await this.db
        .selectFrom('users')
        .selectAll()
        .where('business_id', '=', businessId)
        .where('is_deleted', '=', false)
        .execute();

      return ok(rows.map((row) => this.PesistenceMapper.userToDomain(row)));
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find team members by business',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
