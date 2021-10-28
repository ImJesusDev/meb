import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  currentUser,
  requireAuth,
  validateRequest,
  UserRole,
  UserStatus,
} from "@movers/common";

import { User, UserAttrs } from "../models/user";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { natsClient } from "../nats";
import { UserUpdatedPublisher } from "../events/publishers/user-updated-publisher";
const router = express.Router();

router.post(
  "/api/users/enable-users",
  currentUser,
  requireAuth(),
  [
    body("users").not().isEmpty().withMessage("The users param is required"),
    body("users").isArray().withMessage("The users param must be an array"),
    body("users.*.id").not().isEmpty().withMessage("The user id is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const role = req.body.role as UserRole;
    const users = req.body.users as [{ id: string }];

    const success = [];
    for (const user of users) {
      const existingUser = await User.findById(user.id);
      if (existingUser) {
        existingUser.set({
          deletedAt: null,
        });
        await existingUser.save();
        success.push(existingUser);
        await new UserUpdatedPublisher(natsClient.client).publish({
          id: existingUser.id,
          email: existingUser.email,
          version: existingUser.version,
          documentNumber: existingUser.documentNumber,
          deletedAt: null,
        });
      }
    }
    res.status(201).send(success);
  }
);

export default router;
