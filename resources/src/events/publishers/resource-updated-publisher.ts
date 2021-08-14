import { Publisher, Subjects, ResourceUpdatedEvent } from '@movers/common';

export class ResourceUpdatedPublisher extends Publisher<ResourceUpdatedEvent> {
  subject: Subjects.ResourceUpdated = Subjects.ResourceUpdated;
}
