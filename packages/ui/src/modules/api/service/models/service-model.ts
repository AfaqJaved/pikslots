import type {
	ServiceResponse,
	UpdateServiceAvatarInput,
	UpdateServiceAvatarResponse
} from '@pikslots/shared';

export type ServiceModel = ServiceResponse;
export type UpdateServiceAvatarResult = UpdateServiceAvatarResponse;
export type UpdateServiceInput = UpdateServiceAvatarInput & { serviceId: string };
