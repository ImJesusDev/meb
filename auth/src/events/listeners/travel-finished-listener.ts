import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelFinishedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { UserPoints, PointsType } from '../../models/user-points';
import { Resource } from '../../models/resource';
import { UserRanking } from '../../models/user-ranking';

export class TravelFinishedListener extends Listener<TravelFinishedEvent> {
  subject: Subjects.TravelFinished = Subjects.TravelFinished;
  queueGroupName = queueGroupName;
  POINTS_PER_RENT = 50;

  async onMessage(data: TravelFinishedEvent['data'], msg: Message) {
    // Find user
    const { userId, reservationId, indicators, resourceRef } = data;
    try {
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
        // Get the user ranking for the type
        let userRanking = await UserRanking.findOne({
          userId,
          resourceType: resource.type,
        });

        // If does not have a ranking, create it
        if (!userRanking) {
          userRanking = UserRanking.build({
            userId,
            points: indicators.km,
            resourceType: resource.type,
          });
          await userRanking.save();
        } else {
          // If the user already have a ranking for the given resource
          userRanking.set({
            points: userRanking.points + indicators.km,
          });
          await userRanking.save();
        }
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
    } catch (e) {
      console.log(`Error @TravelCreatedListener`);
      console.log(e);
    }

    msg.ack();
  }
}
