import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
const cors = require('cors');
/* Commons */
import { errorHandler, NotFoundError, currentUser } from '@movers/common';

/* Routers */
import { newClientRouter } from './routes/new';
import { showClientRouter } from './routes/show';
import { indexClientRouter } from './routes/index';
import { updateClientRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
/* New Client */
app.use(newClientRouter);
/* Show Client */
app.use(showClientRouter);
/* List Clients */
app.use(indexClientRouter);
/* Update Client */
app.use(updateClientRouter);

/* Not found error handler */
app.get('*', async () => {
  throw new NotFoundError();
});
/* Error handler middleware */
app.use(errorHandler);

export { app };
