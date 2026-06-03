import z from 'zod';

export const SetPasswordFormSchema = z
	.object({
		newPassword: z.string().min(8, 'Password must be at least 8 characters'),
		retypeNewPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.newPassword === data.retypeNewPassword, {
		message: 'Passwords do not match',
		path: ['retypeNewPassword']
	});

export const OtpFormSchema = z.object({
	otp: z.string().length(6, 'Please enter the 6-digit code')
});
