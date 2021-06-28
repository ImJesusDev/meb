import { Publisher, Subjects, DomainAuthorizedEvent } from '@movers/common';

export class DomainAuthorizedPublisher extends Publisher<DomainAuthorizedEvent> {
  subject: Subjects.DomainAuthorized = Subjects.DomainAuthorized;
}
