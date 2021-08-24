import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelFinishedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { UserPoints, PointsType } from '../../models/user-points';
import { Resource } from '../../models/resource';

export class TravelFinishedListener extends Listener<TravelFinishedEvent> {
  subject: Subjects.TravelFinished = Subjects.TravelFinished;
  queueGroupName = queueGroupName;
  POINTS_PER_RENT = 50;

  async onMessage(data: TravelFinishedEvent['data'], msg: Message) {
    // Find user
    const { userId, reservationId, indicators, resourceRef } = data;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const resource = await Resource.findOne({ reference: resourceRef });
    if (!resource) {
      throw new Error('Resource not found');
    }
    // If the travel has indicators
    if (indicators && indicators.km) {
      const userPoints = UserPoints.build({
        userId,
        reservationId,
        type: PointsType.Distance,
        points: indicators.km,
        createdAt: new Date(),
        resourceType: resource.type,
      });
      await userPoints.save();
      // Update the total user point's
      let totalPoints = user.points
        ? user.points + indicators.km
        : indicators.km;
      user.set({
        points: totalPoints,
      });
      await user.save();
    }

    msg.ack();
  }
}
