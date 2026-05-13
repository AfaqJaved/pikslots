import { User } from '@pickslots/domain';
import {
  domainAuditToPersistence,
  persistenceAuditToDomain,
} from 'src/shared/database/mapper/audit.fields.mapper';
import {
  UserTableInsert,
  UserTableSelect,
} from 'src/shared/database/schema/user.table';

export class UserPersistenceMapper {
  public persistenceToDomain(row: UserTableSelect): User {
    return User.reconstitute({
      id: row.id,
      username: row.username,
      password: row.password,
      name: { firstName: row.first_name, lastName: row.last_name },
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      timezone: row.timezone,
      avatarUrl: row.avatar_url,
      emailVerified: row.email_verified,
      notificationPreferences: {
        email: row.notification_email,
        sms: row.notification_sms,
        push: row.notification_push,
      },
      lastLoginAt: row.last_login_at,
      suspendedReason: row.suspended_reason,
      ...persistenceAuditToDomain(row),
    });
  }
  public domainToPersistence(user: User): UserTableInsert {
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      first_name: user.name.firstName,
      last_name: user.name.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      timezone: user.timezone,
      avatar_url: user.avatarUrl,
      email_verified: user.emailVerified,
      notification_email: user.notificationPreferences.email,
      notification_sms: user.notificationPreferences.sms,
      notification_push: user.notificationPreferences.push,
      last_login_at: user.lastLoginAt,
      suspended_reason: user.suspendedReason,
      ...domainAuditToPersistence(user),
    };
  }
}
