import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
/* Routers */
import { newCountryRouter } from './routes/new-country';
import { indexCountryRouter } from './routes/country-index';
import { newCityRouter } from './routes/new-city';
import { newGeometryRouter } from './routes/new-geometry';
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
/* List countries */
app.use(indexCountryRouter);
/* New City Route */
app.use(newCityRouter);
/* New Geometry Route */
app.use(newGeometryRouter);

/* Not found error handler */
app.get('*', async () => {
  throw new NotFoundError();
});
/* Error handler middleware */
app.use(errorHandler);

export { app };
