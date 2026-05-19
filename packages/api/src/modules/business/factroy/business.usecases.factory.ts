import { Inject, Injectable } from '@nestjs/common';
import { IRegisterBusinessUseCase } from '@pikslots/domain';
import type { RegisterBusinessUseCase } from '@pikslots/domain';

@Injectable()
export class BusinessUseCaseFactory {
  @Inject(IRegisterBusinessUseCase)
  public readonly registerBusinessUseCase: RegisterBusinessUseCase;
}
