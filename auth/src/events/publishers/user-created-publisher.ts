import { Publisher, Subjects, UserCreatedEvent } from '@movers/common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
