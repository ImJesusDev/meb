import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  ResourceStatus,
} from "@movers/common";
import { Resource, ResourceAttrs } from "../models/resource";
import { ResourceType } from "../models/resource-type";
import { Document, DocumentAttrs } from "../models/document";
import { checkupQueue } from "../queues/checkup-queue";
import { natsClient } from "../nats";
import { ResourceCreatedPublisher } from "../events/publishers/resource-created-publisher";
import QRCode from "qrcode";

const router = express.Router();

router.post(
  "/api/resources/load-resources",
  requireAuth(),
  [
    body("resources")
      .not()
      .isEmpty()
      .withMessage("The resources param is required"),
    body("resources")
      .isArray()
      .withMessage("The resources param must be an array"),
    body("resources.*.type")
      .not()
      .isEmpty()
      .withMessage("Resource type is required."),
    body("resources.*.reference")
      .not()
      .isEmpty()
      .withMessage("Resource reference is required."),
    body("resources.*.qrCode")
      .not()
      .isEmpty()
      .withMessage("Resource qrCode is required."),
    body("resources.*.lockerPassword")
      .not()
      .isEmpty()
      .withMessage("Resource lockerPassword is required."),
    body("resources.*.client")
      .not()
      .isEmpty()
      .withMessage("Resource client is required."),
    body("resources.*.office")
      .not()
      .isEmpty()
      .withMessage("Resource office is required."),
    body("resources.*.loanTime")
      .not()
      .isEmpty()
      .withMessage("Resource loanTime is required."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const resources = req.body.resources as ResourceAttrs[];
    const success = [];
    for (const resourceAttrs of resources) {
      const existingResource = await Resource.findOne({
        reference: resourceAttrs.reference,
      });
      if (!existingResource) {
        const existingType = await ResourceType.findOne({
          type: resourceAttrs.type,
        });

        if (!existingType) {
          continue;
        }
        const resource = Resource.build({
          type: resourceAttrs.type,
          reference: resourceAttrs.reference,
          qrCode: resourceAttrs.qrCode,
          lockerPassword: resourceAttrs.lockerPassword,
          client: resourceAttrs.client,
          office: resourceAttrs.office,
          loanTime: resourceAttrs.loanTime,
          clientNumber: resourceAttrs.clientNumber,
          status: ResourceStatus.Available,
        });

        await resource.save();
        const url = `https://meb.moversapp.co/api/resources/find/${resource.id}`;
        const generatedCode = await QRCode.toDataURL(url);
        resource.set({
          qrCode: generatedCode,
        });
        await resource.save();
        success.push(resource);

        await new ResourceCreatedPublisher(natsClient.client).publish({
          id: resource.id,
          type: resource.type,
          reference: resource.reference,
          qrCode: resource.qrCode,
          lockerPassword: resource.lockerPassword,
          client: resource.client,
          clientNumber: resource.clientNumber,
          office: resource.office,
          loanTime: resource.loanTime,
          status: resource.status,
          version: resource.version,
        });

        // Delay of days in ms
        const delay = 1000 * 60 * 60 * 24 * existingType.checkupTime;

        await checkupQueue.add(
          {
            resourceId: resource.id,
          },
          {
            delay,
          }
        );

        console.log(`Created checkup queue with delay ${delay}`);
      }
    }
    res.status(201).send(success);
  }
);
export default router;
