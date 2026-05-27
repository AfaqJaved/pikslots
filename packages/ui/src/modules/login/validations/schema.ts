import z from 'zod';

export const LoginUserFormSchema = z.object({
	userNameOrEmail: z.string().min(1, 'UserName or Email is Required'),
	password: z.string().min(8, 'Password must be atleast 8 characters')
});
