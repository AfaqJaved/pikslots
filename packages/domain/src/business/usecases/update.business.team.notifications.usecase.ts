import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';
import type { NotificationType, TimeUnit } from '../types/';

export interface UpdateBusinessTeamNotificationsCommand {
  id: string;
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: { active: boolean; type: NotificationType; unit: TimeUnit; value: number };
  extraCCEmails: string[];
}

export const IUpdateBusinessTeamNotificationsUseCase = Symbol(
  'IUpdateBusinessTeamNotificationsUseCase',
);

export interface UpdateBusinessTeamNotificationsUseCase {
  execute(
    command: UpdateBusinessTeamNotificationsCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
