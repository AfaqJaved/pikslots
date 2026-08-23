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
 * Supports any number of nested subdomain levels (e.g. 'test.test.fast.com' -> 'test'),
 * always taking the leftmost label as the slug. Returns null for the bare root domain
 * or the app subdomain.
 */
export function getBusinessSlugFromHost(host: string): string | null {
	const hostname = stripPort(host);
	const root = rootDomain();
	const suffix = `.${root}`;

	if (hostname === root || !hostname.endsWith(suffix)) return null;

	const subdomain = hostname.slice(0, -suffix.length);
	if (!subdomain) return null;

	const slug = subdomain.split('.')[0];
	if (!slug || slug === APP_SUBDOMAIN) return null;

	return slug;
}
