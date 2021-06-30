import { Publisher, Subjects, EmailAuthorizedEvent } from '@movers/common';

export class EmailAuthorizedPublisher extends Publisher<EmailAuthorizedEvent> {
  subject: Subjects.EmailAuthorized = Subjects.EmailAuthorized;
}
