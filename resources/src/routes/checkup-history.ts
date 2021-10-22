import express, { Request, Response } from "express";
import { Checkup } from "../models/checkup";
import { Client } from "../models/client";
import { Office } from "../models/office";
import { Resource } from "../models/resource";
const router = express.Router();

router.get(
  "/api/resources/checkups-history",
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    let query: any = {};
    let orClause: any = [];
    const status = req.query.status;
    const from = req.query.from;
    const to = req.query.to;
    const client = req.query.client;
    const office = req.query.office;
    const resourceRef = req.query.resourceRef;

    if (client && !office) {
      const existingClient = await Client.findOne({ name: client });
      if (existingClient) {
        const resources = await Resource.find({ client: existingClient.name });
        for (const resource of resources) {
          orClause.push({ resourceRef: resource.reference });
        }
        query["$or"] = orClause;
      }
    }
    if (office && !client) {
      const existingOffice = await Office.findOne({ name: office });
      if (existingOffice) {
        const resources = await Resource.find({ office: existingOffice.name });
        for (const resource of resources) {
          orClause.push({ resourceRef: resource.reference });
        }
        query["$or"] = orClause;
      }
    }
    if (status) {
      query["status"] = status;
    }
    if (resourceRef) {
      query["resourceRef"] = resourceRef;
    }
    if (to) {
      query["createdAt"] = {
        $lte: new Date(to),
      };
    }
    if (from) {
      query["createdAt"] = {
        $gte: new Date(from),
      };
    }
    if (from && to) {
      query["createdAt"] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const totalResults = await Checkup.find(query).countDocuments();
    const checkups = await Checkup.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(["resource", "assignedUser"]);

    res.status(200).send({
      checkups,
      totalResults,
      page: skip,
      perPage,
    });
  }
);
export default router;
