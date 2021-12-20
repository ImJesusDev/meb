import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  currentUser,
  requireAuth,
  validateRequest,
  UserRole,
  UserStatus,
} from "@movers/common";
import { Domain } from "../models/domain";
import { Email } from "../models/email";
import { User, UserAttrs } from "../models/user";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { natsClient } from "../nats";
const router = express.Router();

router.post(
  "/api/users/load-users",
  currentUser,
  requireAuth(),
  [
    body("users").not().isEmpty().withMessage("The users param is required"),
    body("users").isArray().withMessage("The users param must be an array"),
    body("users.*.firstName")
      .not()
      .isEmpty()
      .withMessage("The firstName is required"),
    body("users.*.mainTransportationMethod")
      .not()
      .isEmpty()
      .withMessage("The mainTransportationMethod is required"),
    body("users.*.secondaryTransportationMethod")
      .not()
      .isEmpty()
      .withMessage("The secondaryTransportationMethod is required"),
    body("users.*.lastName")
      .not()
      .isEmpty()
      .withMessage("The lastName is required"),
    body("users.*.client")
      .not()
      .isEmpty()
      .withMessage("The client is required"),
    body("users.*.password").trim().isLength({ min: 4, max: 20 }),
    body("users.*.email").not().isEmpty().withMessage("The email is required"),
    body("users.*.email").isEmail().withMessage("The email is invalid"),
    body("users.*.office")
      .not()
      .isEmpty()
      .withMessage("The office is required"),
    body("role").not().isEmpty().withMessage("Role is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const role = req.body.role as UserRole;
    const users = req.body.users as UserAttrs[];
    console.log("[Users] load users")
    const success = [];
    const errors = [];
    for (const userAttrs of users) {
      const existingUser = await User.findOne({ email: userAttrs.email });
      if (!existingUser) {
        const domain = userAttrs.email.split("@")[1];
        if (!domain) {
          console.log(
            "No se pudo extraer el dominio del email",
            userAttrs.email
          );
          errors.push({
            user: userAttrs,
            reason: 'No se pudo extraer el dominio del email'
          });
          continue;
        }
        const existingDomain = await Domain.findOne({
          domain,
          client: userAttrs.client,
          active: true,
        });

        if (!existingDomain) {
          const whitelistedEmail = await Email.findOne({
            email: userAttrs.email,
            client: userAttrs.client,
            active: true,
          });
          if (!whitelistedEmail) {
            console.log("Dominio / Email no autorizado");
            errors.push({
              user: userAttrs,
              reason: 'Dominio / Email no autorizado'
            });
            continue;
          }
        }
        const activationCode = User.generateActivationCode();
        const user = User.build({
          email: userAttrs.email,
          password: userAttrs.password,
          firstName: userAttrs.firstName,
          lastName: userAttrs.lastName,
          client: userAttrs.client,
          office: userAttrs.office,
          activationCode,
          role,
          status: UserStatus.Unverified,
          mainTransportationMethod: userAttrs.mainTransportationMethod,
          secondaryTransportationMethod:
            userAttrs.secondaryTransportationMethod,
        });
        await user.save();
        console.log("[Users] LoadUsers - usuario creado");
        console.log(JSON.stringify(user, null, 2));
        success.push(user);
        await new UserCreatedPublisher(natsClient.client).publish({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          version: user.version,
          activationCode: user.activationCode,
          client: user.client!,
          office: user.office!,
        });
      }
    }
    res.status(201).send({success, errors});
  }
);

export default router;
