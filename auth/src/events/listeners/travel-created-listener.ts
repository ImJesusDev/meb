import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { UserPoints, PointsType } from '../../models/user-points';
import { UserRanking } from '../../models/user-ranking';
import { Resource } from '../../models/resource';
export class TravelCreatedListener extends Listener<TravelCreatedEvent> {
  subject: Subjects.TravelCreated = Subjects.TravelCreated;
  queueGroupName = queueGroupName;
  POINTS_PER_RENT = 50;

  async onMessage(data: TravelCreatedEvent['data'], msg: Message) {
    // Find user
    const { userId, reservationId, resourceRef } = data;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return console.log(`User not found id: ${userId}`);
      }
      const resource = await Resource.findOne({ reference: resourceRef });
      if (!resource) {
        return console.log(`Resource not found ref: ${resourceRef}`);
      }
      // Find if the user already have points for this reservation
      // and for the same type (TripCreated). Those are the points
      // given for renting the resource
      let userPoints = await UserPoints.findOne({
        userId,
        reservationId,
        type: PointsType.ResourceRent,
      });

      // Get the user ranking for the type
      let userRanking = await UserRanking.findOne({
        userId,
        resourceType: resource.type,
      });

      // If does not have a ranking, create it
      if (!userRanking) {
        userRanking = UserRanking.build({
          userId,
          points: this.POINTS_PER_RENT,
          resourceType: resource.type,
        });
        await userRanking.save();
      } else {
        // If the user already have a ranking for the given resource
        userRanking.set({
          points: userRanking.points + this.POINTS_PER_RENT,
        });
        await userRanking.save();
      }

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
    } catch (e) {
      console.log(`Error @TravelCreatedListener`);
      console.log(e);
    }

    msg.ack();
  }
}
