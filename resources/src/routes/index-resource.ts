import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
// import { Client } from '../models/client';
// import { Office } from '../models/office';
import { currentUser, ResourceStatus, UserRole } from '@movers/common';
const router = express.Router();
interface QueryParams {
  page: number;
  perPage: number;
  status: string;
  client: string;
  office: string;
  type: string;
  reference: string;
  from: string;
  to: string;
}

interface Params {
  id: string;
}
router.get(
  '/api/resources',
  currentUser,
  async (req: Request<any, any, any, any>, res: Response) => {
    let query: any = {};
    let allClients: any;
    let clientOffices: any;
    const status = req.query.status;
    const client = req.query.client;
    const office = req.query.office;
    const type = req.query.type;
    const reference = req.query.reference;
    const from = req.query.from;
    const to = req.query.to;
    const user = req.currentUser;

    // if (status) query['status'] = status;
    if (client) query['client'] = client;
    if (office) query['office'] = office;
    if (type) query['type'] = type;
    if (reference) query['reference'] = reference;
    
    if (to) {
      query['createdAt'] = {
        $lte: new Date(to),
      };
    }
    if (from) {
      query['createdAt'] = {
        $gte: new Date(from),
      };
    }
    if (from && to) {
      query['createdAt'] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }
    let orClause = [];

    if(status) {
      switch (status) {
        case ResourceStatus.PendingCheckup:
          orClause.push({ status: ResourceStatus.PendingCheckup })
          orClause.push({ status: ResourceStatus.Checkup })
          break;
        case ResourceStatus.PendingMaintenance:
          orClause.push({ status: ResourceStatus.PendingMaintenance })
          orClause.push({ status: ResourceStatus.Maintenance })
          break;
        case ResourceStatus.PendingRepair:
          orClause.push({ status: ResourceStatus.PendingRepair })
          orClause.push({ status: ResourceStatus.Repair })
          break;
        default:
          query['status'] = status;
          break;
      }
    }
    if(orClause.length) {
      query['$or'] = orClause;
    }
    // Here we validate the role of the current user
    // if (user) {
    //   switch (user.role) {
    //     case UserRole.MebSuperAdmin:
    //       // Find all clients for the admin
    //       allClients = await Client.find({ mebSuperAdmin: user.id });
    //       for (const client of allClients) {
    //         // Find all offices of the client
    //         const clientOffices = await Office.find({ client: client.name });
    //         // Create or clause to find resources of the admin offices
    //         for (const office of clientOffices) {
    //           orClause.push({ office: office.name });
    //         }
    //       }
    //       query['$or'] = orClause;
    //       break;
    //     case UserRole.MebAdmin:
    //       // Find all offices of the admin
    //       clientOffices = await Office.find({ mebAdmin: user.id });
    //       console.log('clientOffices', clientOffices);
    //       // Create or clause to find resources of the admin offices
    //       for (const office of clientOffices) {
    //         orClause.push({ office: office.name });
    //       }
    //       query['$or'] = orClause;
    //       break;
    //     case UserRole.Client:
    //       // Find all offices of the admin
    //       clientOffices = await Office.find({ clientAdmin: user.id });
    //       // Create or clause to find resources of the admin offices
    //       for (const office of clientOffices) {
    //         orClause.push({ office: office.name });
    //       }
    //       query['$or'] = orClause;
    //       break;
    //     default:
    //       break;
    //   }
    // }

    console.log("FINAL QUERY", JSON.stringify(query, null, 2))
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const totalResults = await Resource.find(query).countDocuments();
    const resources = await Resource.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['documents', 'checkups', 'repairs', 'maintenances'])
      .populate({
        path: 'repairs',
        populate: ['assignedUser'],
      })
      .populate({
        path: 'checkups',
        populate: ['assignedUser'],
      })
      .populate({
        path: 'maintenances',
        populate: ['assignedUser'],
      });

    res.status(200).send({
      resources,
      totalResults,
      page: skip,
      perPage,
    });
  }
);

export default router;
