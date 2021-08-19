import { Publisher, Subjects, TravelCreatedEvent } from '@movers/common';

export class TravelCreatedPublisher extends Publisher<TravelCreatedEvent> {
  subject: Subjects.TravelCreated = Subjects.TravelCreated;
}
