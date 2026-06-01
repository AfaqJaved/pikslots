import type { ErrorShape } from '@pikslots/domain';

export type EmailSendingFailedError = ErrorShape & {
  kind: 'email_sending_failed';
  to: string;
  template: string;
  cause?: unknown;
};
