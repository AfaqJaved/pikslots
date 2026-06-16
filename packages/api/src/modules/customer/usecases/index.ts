import { Provider } from '@nestjs/common';
import {
  IRegisterCustomerUseCase,
  IEditCustomerUseCase,
  IDeleteCustomerUseCase,
  IFindAllCustomersByBusinessUseCase,
  IFindCustomerByIdUseCase,
} from '@pikslots/domain';
import { RegisterCustomerUseCaseImpl } from './register.customer.usecase.impl';
import { EditCustomerUseCaseImpl } from './edit.customer.usecase.impl';
import { DeleteCustomerUseCaseImpl } from './delete.customer.usecase.impl';
import { FindAllCustomersByBusinessUseCaseImpl } from './find.all.customers.by.business.usecase.impl';
import { FindCustomerByIdUseCaseImpl } from './find.customer.by.id.usecase.impl';

export const CUSTOMER_USECASES: Provider[] = [
  { useClass: RegisterCustomerUseCaseImpl, provide: IRegisterCustomerUseCase },
  { useClass: EditCustomerUseCaseImpl, provide: IEditCustomerUseCase },
  { useClass: DeleteCustomerUseCaseImpl, provide: IDeleteCustomerUseCase },
  {
    useClass: FindAllCustomersByBusinessUseCaseImpl,
    provide: IFindAllCustomersByBusinessUseCase,
  },
  { useClass: FindCustomerByIdUseCaseImpl, provide: IFindCustomerByIdUseCase },
];
