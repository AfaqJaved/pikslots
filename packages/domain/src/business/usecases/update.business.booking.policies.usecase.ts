import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business, TimeUnit } from '../business.entity';

export interface UpdateBusinessBookingPoliciesCommand {
  id: string;
  leadTime: { unit: TimeUnit; value: number };
  scheduleWindow: { unit: TimeUnit; value: number };
  cancellationPolicy: { unit: TimeUnit; value: number } | null;
  bookingPolicyText: string;
  showPolicyOnBookingPage: boolean;
}

export const IUpdateBusinessBookingPoliciesUseCase = Symbol(
  'IUpdateBusinessBookingPoliciesUseCase',
);

export interface UpdateBusinessBookingPoliciesUseCase {
  execute(
    command: UpdateBusinessBookingPoliciesCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
