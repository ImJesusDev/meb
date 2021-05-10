import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

/* Routers */
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { updateUserRouter } from './routes/update';

/* Commons */
import { errorHandler, NotFoundError } from '@movers/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

/* Current User */
app.use(currentUserRouter);
/* Login User */
app.use(signinRouter);
/* Log out User */
app.use(signoutRouter);
/* Register User */
app.use(signupRouter);
/* Update User */
app.use(updateUserRouter);
/* Not found error handler */
app.get('*', async () => {
  throw new NotFoundError();
});
/* Error handler middleware */
app.use(errorHandler);

export { app };
