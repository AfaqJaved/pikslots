import {
  IFindAllRegisteredBusinessesUseCase,
  IFindBusinessByIdUseCase,
  IRegisterBusinessUseCase,
  IUpdateBusinessAppearanceUseCase,
  IUpdateBusinessBrandDetailsUseCase,
  IUpdateBusinessBookingPoliciesUseCase,
  IUpdateBusinessBookingSetupUseCase,
  IUpdateBusinessBookingCustomizationUseCase,
  IUpdateBusinessGalleryPhotosUseCase,
  IUpdateBusinessGeneralUseCase,
  IUpdateBusinessLocationUseCase,
  IUpdateBusinessTeamNotificationsUseCase,
  IUpdateBusinessCustomerNotificationsUseCase,
  IUpdateBusinessNotificationCustomizationUseCase,
  IUpdateBusinessHoursUseCase,
  IUpdateBusinessVisibilityUseCase,
  IUpdateBusinessLinksUseCase,
  IUpdateBusinessContactDetailsUseCase,
  IUpdateBusinessBrandDetilsImagesUseCase,
} from '@pikslots/domain';
import { RegisterBusinessUseCaseImpl } from './register.business.usecase.impl';
import { Provider } from '@nestjs/common';
import { FindAllRegisteredBusinessesUseCaseImpl } from './find.all.registered.businesses.usecase.impl';
import { FindBusinessByIdUseCaseImpl } from './find.business.by.id.usecase.impl';
import { UpdateBusinessBrandDetailsUseCaseImpl } from './update.business.brand.details.usecase.impl';
import { UpdateBusinessAppearanceUseCaseImpl } from './update.business.appearance.usecase.impl';
import { UpdateBusinessLocationUseCaseImpl } from './update.business.location.usecase.impl';
import { UpdateBusinessGeneralUseCaseImpl } from './update.business.general.usecase.impl';
import { UpdateBusinessBookingPoliciesUseCaseImpl } from './update.business.booking.policies.usecase.impl';
import { UpdateBusinessBookingSetupUseCaseImpl } from './update.business.booking.setup.usecase.impl';
import { UpdateBusinessBookingCustomizationUseCaseImpl } from './update.business.booking.customization.usecase.impl';
import { UpdateBusinessVisibilityUseCaseImpl } from './update.business.visibility.usecase.impl';
import { UpdateBusinessTeamNotificationsUseCaseImpl } from './update.business.team.notifications.usecase.impl';
import { UpdateBusinessCustomerNotificationsUseCaseImpl } from './update.business.customer.notifications.usecase.impl';
import { UpdateBusinessNotificationCustomizationUseCaseImpl } from './update.business.notification.customization.usecase.impl';
import { UpdateBusinessHoursUseCaseImpl } from './update.business.hours.usecase.impl';
import { UpdateBusinessLinksUseCaseImpl } from './update.business.links.usecase.impl';
import { UpdateBusinessContactDetailsUseCaseImpl } from './update.business.contact.details.usecase.impl';
import { UpdateBusinessBrandDetailsImagesUseCaseImpl } from './update.business.brand.details.images.usecase.impl';
import { UpdateBusinessGalleryPhotosUseCaseImpl } from './update.business.gallery.photos.usecase.impl';

export const BUSINESS_USECASES: Provider[] = [
  {
    useClass: RegisterBusinessUseCaseImpl,
    provide: IRegisterBusinessUseCase,
  },
  {
    useClass: FindAllRegisteredBusinessesUseCaseImpl,
    provide: IFindAllRegisteredBusinessesUseCase,
  },
  {
    useClass: FindBusinessByIdUseCaseImpl,
    provide: IFindBusinessByIdUseCase,
  },
  {
    useClass: UpdateBusinessBrandDetailsUseCaseImpl,
    provide: IUpdateBusinessBrandDetailsUseCase,
  },
  {
    useClass: UpdateBusinessAppearanceUseCaseImpl,
    provide: IUpdateBusinessAppearanceUseCase,
  },
  {
    useClass: UpdateBusinessLocationUseCaseImpl,
    provide: IUpdateBusinessLocationUseCase,
  },
  {
    useClass: UpdateBusinessGeneralUseCaseImpl,
    provide: IUpdateBusinessGeneralUseCase,
  },
  {
    useClass: UpdateBusinessBookingPoliciesUseCaseImpl,
    provide: IUpdateBusinessBookingPoliciesUseCase,
  },
  {
    useClass: UpdateBusinessBookingSetupUseCaseImpl,
    provide: IUpdateBusinessBookingSetupUseCase,
  },
  {
    useClass: UpdateBusinessBookingCustomizationUseCaseImpl,
    provide: IUpdateBusinessBookingCustomizationUseCase,
  },
  {
    useClass: UpdateBusinessVisibilityUseCaseImpl,
    provide: IUpdateBusinessVisibilityUseCase,
  },
  {
    useClass: UpdateBusinessTeamNotificationsUseCaseImpl,
    provide: IUpdateBusinessTeamNotificationsUseCase,
  },
  {
    useClass: UpdateBusinessCustomerNotificationsUseCaseImpl,
    provide: IUpdateBusinessCustomerNotificationsUseCase,
  },
  {
    useClass: UpdateBusinessNotificationCustomizationUseCaseImpl,
    provide: IUpdateBusinessNotificationCustomizationUseCase,
  },
  {
    useClass: UpdateBusinessHoursUseCaseImpl,
    provide: IUpdateBusinessHoursUseCase,
  },
  {
    useClass: UpdateBusinessLinksUseCaseImpl,
    provide: IUpdateBusinessLinksUseCase,
  },
  {
    useClass: UpdateBusinessContactDetailsUseCaseImpl,
    provide: IUpdateBusinessContactDetailsUseCase,
  },
  {
    useClass: UpdateBusinessBrandDetailsImagesUseCaseImpl,
    provide: IUpdateBusinessBrandDetilsImagesUseCase,
  },
  {
    useClass: UpdateBusinessGalleryPhotosUseCaseImpl,
    provide: IUpdateBusinessGalleryPhotosUseCase,
  },
];
