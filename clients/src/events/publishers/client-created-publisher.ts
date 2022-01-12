import { Publisher, Subjects, ClientCreatedEvent } from '@movers/common';

export class ClientCreatedPublisher extends Publisher<ClientCreatedEvent> {
  subject: Subjects.ClientCreated = Subjects.ClientCreated;
}
