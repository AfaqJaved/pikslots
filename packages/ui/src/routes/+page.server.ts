import { getBusinessSlugFromHost, isAppHost } from '$utils/tenant-host';

export const load = ({ url }) => {
	const host = url.hostname;

	console.log(host);
	console.log(getBusinessSlugFromHost(host));

	return {
		businessSlug: getBusinessSlugFromHost(host),
		isAppHost: isAppHost(host)
	};
};
