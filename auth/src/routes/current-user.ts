import express from 'express';
/* Middleware */
import { currentUser } from '@movers/common';

const router = express.Router();

router.get('/api/users/current-user', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
