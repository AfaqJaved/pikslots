import { getBusinessSlugFromHost, isAppHost } from '$utils/tenant-host';

export const load = ({ url }) => {
	const host = url.hostname;

	return {
		businessSlug: getBusinessSlugFromHost(host),
		isAppHost: isAppHost(host)
	};
};
