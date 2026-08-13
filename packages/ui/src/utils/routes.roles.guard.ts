import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

type UserRole =
	| 'Platform Owner'
	| 'Business Owner'
	| 'No Access'
	| 'Standard'
	| 'Enhanced'
	| 'Admin';

export const routeRolesGuard = (allowedRoles: UserRole[], currentRole: UserRole | null) => {
	if (!currentRole) {
		goto(resolve('/login'));
		return false;
	}
	if (!allowedRoles.includes(currentRole)) {
		goto(resolve('/home'));
		return false;
	}
	return true;
};
