import { Publisher, Subjects, PasswordResetEvent } from '@movers/common';

export class PasswordResetPublisher extends Publisher<PasswordResetEvent> {
  subject: Subjects.PasswordReset = Subjects.PasswordReset;
}
