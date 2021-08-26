import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelFinishedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Resource } from '../../models/resource';
import { Travel } from '../../models/travel';

export class TravelFinishedListener extends Listener<TravelFinishedEvent> {
  subject: Subjects.TravelFinished = Subjects.TravelFinished;
  queueGroupName = queueGroupName;

  async onMessage(data: TravelFinishedEvent['data'], msg: Message) {
    // Find user
    const { userId, reservationId, indicators, status, resourceRef } = data;
    const resource = await Resource.findOne({ reference: resourceRef });
    if (!resource) {
      return console.log(`Resource not found ref: ${resourceRef}`);
    }
    const travel = await Travel.findByEvent(data);

    if (!travel) {
      return console.log(`Travel not found id: ${data.id}`);
    }

    travel.set({
      indicators,
      status,
    });

    await travel.save();

    msg.ack();
  }
}
