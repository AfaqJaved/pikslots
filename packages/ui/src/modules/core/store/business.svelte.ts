import type { BusinessModel } from '../../api/business/models/business-model';

function createBusinessStore() {
	let selectedBusiness = $state<BusinessModel | null>(null);

	function setSelectedBusiness(business: BusinessModel) {
		console.log('business selected sucessfully' + business.id);

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
