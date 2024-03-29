import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  ResourceStatus,
} from "@movers/common";
import { Resource } from "../models/resource";
import { ResourceType } from "../models/resource-type";
import { Document, DocumentAttrs } from "../models/document";
import { checkupQueue } from "../queues/checkup-queue";
import { natsClient } from "../nats";
import { ResourceCreatedPublisher } from "../events/publishers/resource-created-publisher";
import QRCode from "qrcode";

const router = express.Router();

router.post(
  "/api/resources",
  requireAuth(),
  [
    body("type").not().isEmpty().withMessage("Resource type is required."),
    body("reference")
      .not()
      .isEmpty()
      .withMessage("Resource reference is required."),
    body("qrCode").not().isEmpty().withMessage("Resource qrCode is required."),
    body("lockerPassword")
      .not()
      .isEmpty()
      .withMessage("Resource lockerPassword is required."),
    body("client").not().isEmpty().withMessage("Resource client is required."),
    body("office").not().isEmpty().withMessage("Resource office is required."),
    body("loanTime")
      .not()
      .isEmpty()
      .withMessage("Resource loanTime is required."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      type,
      reference,
      qrCode,
      lockerPassword,
      client,
      office,
      loanTime,
      clientNumber,
    } = req.body;
    const documents = req.body.documents as DocumentAttrs[];
    const existingDocs = await Document.find({});
    const existingResource = await Resource.findOne({ reference });
    if (existingResource) {
      throw new BadRequestError("The reference already exists");
    }
    if (documents && documents.length) {
      for (const document of documents) {
        const newDoc = Document.build(document);
        await newDoc.save();
      }
    }

    const existingType = await ResourceType.findOne({ type }).populate([
      "documentTypes",
    ]);

    if (!existingType) {
      throw new BadRequestError("The resource type does not exists");
    }

    const resource = Resource.build({
      type,
      reference,
      qrCode,
      lockerPassword,
      passwordDate: new Date(),
      client,
      office,
      loanTime,
      status: ResourceStatus.Available,
      clientNumber,
    });

    await resource.save();
    const url = `https://meb.moversapp.co/api/resources/find-by-ref?ref=${resource.reference}`;
    const generatedCode = await QRCode.toDataURL(url);
    resource.set({
      qrCode: generatedCode,
    });
    await resource.save();

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
      photo: existingType.photo,
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

    res.status(201).send(resource);
  }
);
export default router;
