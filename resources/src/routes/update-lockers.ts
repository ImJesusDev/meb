import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@movers/common";
import { Resource, ResourceAttrs } from "../models/resource";
import { natsClient } from "../nats";
import { ResourceUpdatedPublisher } from "../events/publishers/resource-updated-publisher";

const router = express.Router();

router.post(
  "/api/resources/update-lockers",
  requireAuth(),
  [
    body("resources")
      .not()
      .isEmpty()
      .withMessage("The resources param is required"),
    body("resources")
      .isArray()
      .withMessage("The resources param must be an array"),
    body("resources.*.reference")
      .not()
      .isEmpty()
      .withMessage("Resource reference is required."),
    body("resources.*.lockerPassword")
      .not()
      .isEmpty()
      .withMessage("Resource lockerPassword is required."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const resources = req.body.resources as ResourceAttrs[];
    const success = [];
    for (const resourceAttrs of resources) {
      const existingResource = await Resource.findOne({
        reference: resourceAttrs.reference,
      });
      if (existingResource) {
        existingResource.set({
          previousPassword: existingResource.lockerPassword,
          passwordDate: new Date(),
          lockerPassword: resourceAttrs.lockerPassword,
        });

        await existingResource.save();
        success.push(existingResource);

        await new ResourceUpdatedPublisher(natsClient.client).publish({
          id: existingResource.id,
          type: existingResource.type,
          reference: existingResource.reference,
          qrCode: existingResource.qrCode,
          lockerPassword: existingResource.lockerPassword,
          client: existingResource.client,
          office: existingResource.office,
          loanTime: existingResource.loanTime,
          status: existingResource.status,
          version: existingResource.version,
        });
      }
    }
    res.status(201).send(success);
  }
);
export default router;
