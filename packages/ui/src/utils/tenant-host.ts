const APP_SUBDOMAIN = 'app';

/** e.g. 'pikslots.com' in production, 'localhost' in dev (via VITE_APP_ROOT_DOMAIN). */
function rootDomain(): string {
	return import.meta.env.VITE_APP_ROOT_DOMAIN || 'localhost';
}

function stripPort(host: string): string {
	return host.split(':')[0];
}

/** True for app.{rootDomain} — where the authenticated dashboard (/home, /login, ...) lives. */
export function isAppHost(host: string): boolean {
	return stripPort(host) === `${APP_SUBDOMAIN}.${rootDomain()}`;
}

/**
 * Extracts the tenant business slug from a hostname, e.g. 'afaq.pikslots.com' -> 'afaq'.
 * Returns null for the bare root domain, the app subdomain, or anything with more than
 * one subdomain label (no nested tenant subdomains).
 */
export function getBusinessSlugFromHost(host: string): string | null {
	const hostname = stripPort(host);
	const root = rootDomain();
	const suffix = `.${root}`;

	if (hostname === root || !hostname.endsWith(suffix)) return null;

	const subdomain = hostname.slice(0, -suffix.length);
	if (!subdomain || subdomain.includes('.') || subdomain === APP_SUBDOMAIN) return null;

	return subdomain;
}
