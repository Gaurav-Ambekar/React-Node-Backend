import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import * as dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';
import HttpException from './Expections/HttpException';
import UserRoute from './Routes/User.route';
import AuthRoute from './Routes/Auth.route';
dotenv.config();
const app: Application = express();

// settings
app.set('port', process.env.PORT);

// middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(morgan('dev'));

// routes
app.use('/backend/auth', AuthRoute);
app.use('/backend/users', UserRoute);
app.use(
  '/backend/api/profile',
  express.static(path.resolve('public', 'uploads', 'profile'))
);

// handle invalid route
app.use(async (req: Request, res: Response, next: NextFunction) => {
  next(new createError.NotFound('This route does not exist...'));
});

// catch all error
app.use(
  (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
      status: err.status || 500,
      message: err.message,
    });
  }
);

export default app;
