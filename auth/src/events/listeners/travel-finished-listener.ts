import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TravelFinishedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { UserPoints, PointsType } from '../../models/user-points';
import { Resource } from '../../models/resource';
import { UserRanking } from '../../models/user-ranking';
import { UserIndicators } from '../../models/user-indicators';
import { UserUpdatedPublisher } from "../publishers/user-updated-publisher";
import { natsClient } from "../../nats";

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
        return console.log(`User not found id: ${userId}`);
      }
      const resource = await Resource.findOne({ reference: resourceRef });
      if (!resource) {
        return console.log(`Resource not found ref: ${resourceRef}`);
      }
      // If the travel has indicators
      if (indicators && indicators.km) {
        // get the user indicators for the type
        let userIndicators = await UserIndicators.findOne({
          userId,
          resourceType: resource.type,
        });
        if (!userIndicators) {
          // If the user does not have indicators
          userIndicators = UserIndicators.build({
            userId,
            energyFootprint: indicators.energyFootprint,
            environmentalFootprint: indicators.environmentalFootprint,
            economicFootprint: indicators.economicFootprint,
            calories: indicators.calories,
            km: indicators.km,
            resourceType: resource.type,
            createdAt: new Date(),
          });
          await userIndicators.save();
        } else {
          userIndicators.set({
            energyFootprint:
              userIndicators.energyFootprint + indicators.energyFootprint,
            environmentalFootprint:
              userIndicators.environmentalFootprint +
              indicators.environmentalFootprint,
            economicFootprint:
              userIndicators.economicFootprint + indicators.economicFootprint,
            calories: userIndicators.calories + indicators.calories,
            km: userIndicators.km + indicators.km,
          });
          await userIndicators.save();
        }
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
        console.log(`[TravelFinishedListener ] USER ${user.email} to version ${user.version}`);
        await new UserUpdatedPublisher(natsClient.client).publish({
          id: user.id,
          email: user.email,
          version: user.version,
          documentNumber: user.documentNumber,
        });
      }
    } catch (e) {
      console.log(`Error @TravelCreatedListener`);
      console.log(e);
    }

    msg.ack();
  }
}
