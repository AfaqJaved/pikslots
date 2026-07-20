import { Inject, Injectable } from '@nestjs/common';
import {
  IRegisterCustomerUseCase,
  IEditCustomerUseCase,
  IDeleteCustomerUseCase,
  IFindAllCustomersByBusinessUseCase,
  IFindCustomerByIdUseCase,
  IUpdateCustomerProfileImageUseCase,
} from '@pikslots/domain';
import type {
  RegisterCustomerUseCase,
  EditCustomerUseCase,
  DeleteCustomerUseCase,
  FindAllCustomersByBusinessUseCase,
  FindCustomerByIdUseCase,
  UpdateCustomerProfileImageUseCase,
} from '@pikslots/domain';

@Injectable()
export class CustomerUseCasesFactory {
  @Inject(IRegisterCustomerUseCase)
  public readonly registerCustomerUseCase: RegisterCustomerUseCase;

  @Inject(IEditCustomerUseCase)
  public readonly editCustomerUseCase: EditCustomerUseCase;

  @Inject(IDeleteCustomerUseCase)
  public readonly deleteCustomerUseCase: DeleteCustomerUseCase;

  @Inject(IFindAllCustomersByBusinessUseCase)
  public readonly findAllCustomersByBusinessUseCase: FindAllCustomersByBusinessUseCase;

  @Inject(IFindCustomerByIdUseCase)
  public readonly findCustomerByIdUseCase: FindCustomerByIdUseCase;

  @Inject(IUpdateCustomerProfileImageUseCase)
  public readonly updateCustomerProfileImageUseCase: UpdateCustomerProfileImageUseCase;
}
