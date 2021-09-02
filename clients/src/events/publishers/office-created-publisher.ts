import { Publisher, Subjects, OfficeCreatedEvent } from '@movers/common';

export class OfficeCreatedPublisher extends Publisher<OfficeCreatedEvent> {
  subject: Subjects.OfficeCreated = Subjects.OfficeCreated;
}
