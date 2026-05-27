import type { BusinessResponse } from '@pikslots/shared';

function createBusinessStore() {
	let selectedBusiness = $state<BusinessResponse | null>(null);

	function setSelectedBusiness(business: BusinessResponse) {
		selectedBusiness = business;
	}

	function clearSelectedBusiness() {
		selectedBusiness = null;
	}

	return {
		get selectedBusiness() {
			return selectedBusiness;
		},
		get hasSelectedBusiness(): boolean {
			return selectedBusiness !== null;
		},
		setSelectedBusiness,
		clearSelectedBusiness
	};
}

export const businessStore = createBusinessStore();
