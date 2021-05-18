import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
/* Routers */
import { newCountryRouter } from './routes/new-country';
/* Commons */
import { errorHandler, NotFoundError, currentUser } from '@movers/common';

/* Routers */

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
/* Current */
app.use(currentUser);

/* New Country Route */
app.use(newCountryRouter);

/* Not found error handler */
app.get('*', async () => {
  throw new NotFoundError();
});
/* Error handler middleware */
app.use(errorHandler);

export { app };
