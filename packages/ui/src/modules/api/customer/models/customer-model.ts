import type {
	FullCustomerResponse,
	PartialCustomerResponse,
	UpdateCustomerProfileImageInput
} from '@pikslots/shared';

export type PartialCustomerModel = PartialCustomerResponse;
export type FullCustomerModel = FullCustomerResponse;
export type CustomerModel = FullCustomerResponse;
export type customerProfileImageInput = UpdateCustomerProfileImageInput & { customerId: string };
