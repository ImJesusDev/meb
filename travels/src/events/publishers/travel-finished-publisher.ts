import { Publisher, Subjects, TravelFinishedEvent } from '@movers/common';

export class TravelFinishedPublisher extends Publisher<TravelFinishedEvent> {
  subject: Subjects.TravelFinished = Subjects.TravelFinished;
}
