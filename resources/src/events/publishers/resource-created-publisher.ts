import { Publisher, Subjects, ResourceCreatedEvent } from '@movers/common';

export class ResourceCreatedPublisher extends Publisher<ResourceCreatedEvent> {
  subject: Subjects.ResourceCreated = Subjects.ResourceCreated;
}
