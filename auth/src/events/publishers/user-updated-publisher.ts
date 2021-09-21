import { Publisher, Subjects, UserUpdatedEvent } from '@movers/common';

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
