import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { UserPoints, PointsType } from '../../models/user-points';
import { Resource } from '../../models/resource';
export class TravelCreatedListener extends Listener<TravelCreatedEvent> {
  subject: Subjects.TravelCreated = Subjects.TravelCreated;
  queueGroupName = queueGroupName;
  POINTS_PER_RENT = 50;

  async onMessage(data: TravelCreatedEvent['data'], msg: Message) {
    // Find user
    const { userId, reservationId, resourceRef } = data;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const resource = await Resource.findOne({ reference: resourceRef });
    if (!resource) {
      throw new Error('Resource not found');
    }
    // Find if the user already have points for this reservation
    // and for the same type (TripCreated). Those are the points
    // given for renting the resource
    let userPoints = await UserPoints.findOne({
      userId,
      reservationId,
      type: PointsType.ResourceRent,
    });

    if (!userPoints) {
      userPoints = UserPoints.build({
        userId,
        reservationId,
        type: PointsType.ResourceRent,
        points: this.POINTS_PER_RENT,
        createdAt: new Date(),
        resourceType: resource.type,
      });
      await userPoints.save();
      // Update the total user point's
      let totalPoints = user.points
        ? user.points + this.POINTS_PER_RENT
        : this.POINTS_PER_RENT;

      user.set({
        points: totalPoints,
      });

      await user.save();
    }

    msg.ack();
  }
}
