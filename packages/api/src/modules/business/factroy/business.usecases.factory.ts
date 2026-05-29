import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllRegisteredBusinessesUseCase,
  IRegisterBusinessUseCase,
  IUpdateBusinessBrandDetailsUseCase,
} from '@pikslots/domain';
import type {
  FindAllRegisteredBusinessesUseCase,
  RegisterBusinessUseCase,
  UpdateBusinessBrandDetailsUseCase,
} from '@pikslots/domain';

@Injectable()
export class BusinessUseCaseFactory {
  @Inject(IRegisterBusinessUseCase)
  public readonly registerBusinessUseCase: RegisterBusinessUseCase;

  @Inject(IFindAllRegisteredBusinessesUseCase)
  public readonly findAllRegisteredBusinessesUseCase: FindAllRegisteredBusinessesUseCase;

  @Inject(IUpdateBusinessBrandDetailsUseCase)
  public readonly updateBusinessBrandDetailsUseCase: UpdateBusinessBrandDetailsUseCase;
}
