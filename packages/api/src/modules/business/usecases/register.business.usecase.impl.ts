import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  BusinessAlreadyExistsError,
  IBusinessRepository,
  InfrastructureError,
  RegisterBusinessUseCase,
  CreateBusinessCommand,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import type { BusinessRepository } from '@pikslots/domain';

@Injectable()
export class RegisterBusinessUseCaseImpl implements RegisterBusinessUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
  ) {}

  async execute(
    command: CreateBusinessCommand,
  ): Promise<
    Result<
      { message: 'success' },
      BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    const business: Business = Business.create({
      id: uuidv7(),
      ownerId: command.ownerId,
      slug: command.slug,
      name: command.name,
      industry: command.industry,
      defaultTimeZone: command.defaultTimeZone,
      createdBy: command.ownerId,
    });

    const result = await this.businessRepository.save(business);

    if (!result.ok) {
      return err(result.error);
    }
    //TODO New Business Invite Email

    return ok({ message: 'success' });
  }
}
