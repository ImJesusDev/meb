import express, { Request, Response } from "express";
import { ResourceType } from "../models/resource-type";
import { NotFoundError } from "@movers/common";

const router = express.Router();

router.get(
  "/api/resources/resource-types/:id",
  async (req: Request, res: Response) => {
    const resourceType = await ResourceType.findById(req.params.id).populate([
      "documentTypes",
      "components",
    ]);
    if (!resourceType) {
      throw new NotFoundError();
    }
    res.status(200).send(resourceType);
  }
);

export default router;
