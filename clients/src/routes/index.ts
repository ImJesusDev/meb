import express, { Request, Response } from "express";
/* Models */
import { Client } from "../models/client";
import { currentUser, UserRole } from "@movers/common";
const router = express.Router();

router.get("/api/clients", currentUser, async (req: Request, res: Response) => {
  const user = req.currentUser;
  let clients, query: any;
  if (!user) {
    clients = await Client.find({
      deletedAt: null,
    });
  } else {
    query = {};
    query["deletedAt"] = null;
    if (user.role === UserRole.MebAdmin) {
      query["mebAdmin"] = user.id;
    }
    if (user.role === UserRole.Client) {
      query["superAdminClient"] = user.id;
    }

    clients = await Client.find(query)
      .limit(10)
      .populate([
        "meb_admin",
        "super_admin_client",
        "offices",
        "domains",
        "emails",
        "users",
      ])
      .populate({
        path: "offices",
        populate: ["emails"],
      });
  }

  res.send(clients);
});

export { router as indexClientRouter };
