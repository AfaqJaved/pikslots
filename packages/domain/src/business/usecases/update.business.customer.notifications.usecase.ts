import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business, NotificationType, TimeUnit } from '../business.entity';

export interface UpdateBusinessCustomerNotificationsCommand {
  id: string;
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: { active: boolean; type: NotificationType; unit: TimeUnit; value: number };
}

export const IUpdateBusinessCustomerNotificationsUseCase = Symbol(
  'IUpdateBusinessCustomerNotificationsUseCase',
);

export interface UpdateBusinessCustomerNotificationsUseCase {
  execute(
    command: UpdateBusinessCustomerNotificationsCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
