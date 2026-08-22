export function getTimezones(): string[] {
	try {
		const zones = Intl.supportedValuesOf('timeZone') as string[];
		return zones.sort();
	} catch {
		return [
			'UTC',
			'America/New_York',
			'America/Chicago',
			'America/Denver',
			'America/Los_Angeles',
			'Europe/London',
			'Europe/Paris',
			'Asia/Tokyo',
			'Australia/Sydney'
		];
	}
}

export function timezoneLabel(tz: string): string {
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: tz,
			timeZoneName: 'shortOffset'
		});
		const parts = formatter.formatToParts(new Date());
		const offsetPart = parts.find((p) => p.type === 'timeZoneName');
		const offset = offsetPart ? offsetPart.value : '';
		return `${tz.replace(/_/g, ' ')} (${offset})`;
	} catch {
		return tz.replace(/_/g, ' ');
	}
}
