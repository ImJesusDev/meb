import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Resource } from '../../models/resource';
import { Travel } from '../../models/travel';
export class TravelCreatedListener extends Listener<TravelCreatedEvent> {
  subject: Subjects.TravelCreated = Subjects.TravelCreated;
  queueGroupName = queueGroupName;
  POINTS_PER_RENT = 50;

  async onMessage(data: TravelCreatedEvent['data'], msg: Message) {
    // Find user
    const {
      id,
      origin,
      destination,
      status,
      userId,
      reservationId,
      resourceRef,
    } = data;

    const resource = await Resource.findOne({ reference: resourceRef });
    if (!resource) {
      throw new Error('Resource not found');
    }

    const travel = Travel.build({
      id,
      origin,
      destination,
      resourceRef,
      reservationId,
      status,
      userId,
    });

    await travel.save();

    msg.ack();
  }
}
