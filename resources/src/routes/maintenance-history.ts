import express, { Request, Response } from "express";
import { Maintenance } from "../models/maintenance";
import { Resource } from "../models/resource";
const router = express.Router();

router.get(
  "/api/resources/maintenances-history",
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
      const resources = await Resource.find({ client: client });
      for (const resource of resources) {
        orClause.push({ resourceRef: resource.reference });
      }
      query["$or"] = orClause;
    }
    if (office && !client) {
      const resources = await Resource.find({ office: office });
      for (const resource of resources) {
        orClause.push({ resourceRef: resource.reference });
      }
      query["$or"] = orClause;
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
    if (status) {
      query["status"] = status;
    }
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const totalResults = await Maintenance.find(query).countDocuments();
    const maintenances = await Maintenance.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(["resource", "assignedUser"]);

    res.status(200).send({
      maintenances,
      totalResults,
      page: skip,
      perPage,
    });
  }
);
export default router;
