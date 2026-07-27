import type { InfrastructureError, Result } from '../../shared';
import type { PublicBookingPageDetailsNotFound } from '../errors';
import type { PublicBookingPage } from '../public.booking.page.props';

export const IFindBookingPageDetailsByBusinessSlugUseCase = Symbol(
  'IFindBookingPageDetailsByBusinessSlug',
);

export interface FindBookingPageDetailsByBusinessSlugUseCase {
  execute(
    businessSlug: string,
  ): Promise<Result<PublicBookingPage, PublicBookingPageDetailsNotFound | InfrastructureError>>;
}
