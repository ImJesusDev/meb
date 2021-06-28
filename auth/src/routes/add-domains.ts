import express, { Request, Response } from 'express';
import { body } from 'express-validator';

/* Commons */
import { requireAuth, validateRequest, currentUser } from '@movers/common';

/* Models */
import { Domain } from '../models/domain';
/* Publishers */
import { DomainAuthorizedPublisher } from '../events/publishers/domain-authorized-publisher';
/* NATS Client */
import { natsClient } from '../nats';
const router = express.Router();

router.post(
  '/api/users/domains',
  currentUser,
  requireAuth(),
  [
    body('domains').isArray().withMessage('Domains must be an array'),
    body('domains').not().isEmpty().withMessage('Domains are required array'),
    body('domains.*.domain').not().isEmpty().withMessage('Domain is required'),
    body('domains.*.domain').isFQDN().withMessage('The domain is invalid'),
    body('domains.*.client').not().isEmpty().withMessage('Client is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const domains = req.body.domains as { domain: string; client: string }[];
    const success = [];

    for (const domain of domains) {
      const existingDomain = await Domain.findOne({
        domain: domain.domain,
        client: domain.client,
      });
      // Find domain by domain and client

      if (!existingDomain) {
        const newDomain = Domain.build({
          domain: domain.domain,
          client: domain.client,
          active: true,
        });
        await newDomain.save();
        success.push(newDomain);
        await new DomainAuthorizedPublisher(natsClient.client).publish({
          id: newDomain.id,
          domain: newDomain.domain,
          client: newDomain.client,
          active: newDomain.active,
          version: newDomain.version,
        });
      }
    }

    res.status(201).send(success);
  }
);

export default router;
