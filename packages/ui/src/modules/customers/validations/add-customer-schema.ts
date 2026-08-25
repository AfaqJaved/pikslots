import { z } from 'zod';

// ── Reusable primitives ──────────────────────────────────────────────

const requiredName = (label: string) =>
	z
		.string()
		.trim()
		.min(1, `${label} is required`)
		.max(100, `${label} must be under 100 characters`)
		.regex(/^[\p{L}\p{M}\s'.-]+$/u, `${label} contains invalid characters`);

const optionalString = (max = 255) => z.string().trim().max(max).optional().or(z.literal(''));

const optionalEmail = z
	.string()
	.trim()
	.toLowerCase()
	.max(254, 'Email is too long')
	.email('Invalid email')
	.optional()
	.or(z.literal(''));

// E.164-ish: digits only, 4–15 digits (ITU-T E.164 max length)
const phoneNumber = z
	.string()
	.trim()
	.regex(/^\d{4,15}$/, 'Phone number must contain 4–15 digits')
	.optional()
	.or(z.literal(''));

// ISO 3166-1 alpha-2 (e.g. "PK", "US") — adjust if you store dial codes instead
const countryCode = z
	.string()
	.trim()
	.regex(/^[A-Z]{2}$/, 'Country code must be a 2-letter ISO code (e.g. PK, US)');

const zipCode = z
	.string()
	.trim()
	.max(20)
	.regex(/^[A-Za-z0-9\s-]*$/, 'Invalid zip/postal code')
	.optional()
	.or(z.literal(''));

const optionalUrl = (label: string) =>
	z.string().trim().max(2048).url(`Invalid ${label} URL`).optional().or(z.literal(''));

// Social "handle" fields — accept either a full profile URL or a bare handle
const socialHandleOrUrl = (label: string, hostPattern?: RegExp) =>
	z
		.string()
		.trim()
		.max(255)
		.optional()
		.or(z.literal(''))
		.refine(
			(val) => {
				if (!val) return true;
				if (val.startsWith('http://') || val.startsWith('https://')) {
					try {
						const url = new URL(val);
						return hostPattern ? hostPattern.test(url.hostname) : true;
					} catch {
						return false;
					}
				}
				// bare handle: letters, numbers, dots, underscores, dashes
				return /^@?[\w.-]{1,100}$/.test(val);
			},
			{ message: `Invalid ${label} handle or URL` }
		);

// ── Schema ────────────────────────────────────────────────────────────

export const AddCustomerSchema = z
	.object({
		firstName: requiredName('First name'),
		lastName: requiredName('Last name'),

		countryCode,
		phone: phoneNumber,

		email: optionalEmail,

		company: optionalString(150),

		country: z.string().trim().min(1, 'Country is required').max(100),
		address: optionalString(255),
		city: optionalString(100),
		state: optionalString(100),
		zipCode,

		additionalPhone: phoneNumber,
		additionalEmail: optionalEmail,

		website: optionalUrl('website'),
		instagram: socialHandleOrUrl('Instagram', /instagram\.com$/i),
		facebook: socialHandleOrUrl('Facebook', /facebook\.com$/i),
		x: socialHandleOrUrl('X', /(x|twitter)\.com$/i),
		youtube: socialHandleOrUrl('YouTube', /youtube\.com$|youtu\.be$/i),
		linkedin: socialHandleOrUrl('LinkedIn', /linkedin\.com$/i)
	})
	// At least one contact method should exist — adjust to your business rule
	.refine((data) => data.email !== '' || data.phone !== '', {
		message: 'At least one of email or phone is required',
		path: ['email']
	});

export type AddCustomerInput = z.infer<typeof AddCustomerSchema>;
