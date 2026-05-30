import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';

export interface UpdateBusinessNotificationCustomizationCommand {
  id: string;
  emailSenderName: string;
  emailSignature: string;
}

export const IUpdateBusinessNotificationCustomizationUseCase = Symbol(
  'IUpdateBusinessNotificationCustomizationUseCase',
);

export interface UpdateBusinessNotificationCustomizationUseCase {
  execute(
    command: UpdateBusinessNotificationCustomizationCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
