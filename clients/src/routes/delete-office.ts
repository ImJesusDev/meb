import express, { request, Request, Response } from 'express';
/* Models */
import { Office } from '../models/office';
/* Commons */
import { NotFoundError } from '@movers/common';

const router = express.Router();

router.delete(
  '/api/clients/:id/offices/:officeId',
  async (req: Request, res: Response) => {
    const office = await Office.findById(req.params.officeId);
    if (!office) {
      throw new NotFoundError();
    }
    office.delete();
    res.status(204).send({});
  }
);

export { router as deleteOfficeRouter };
