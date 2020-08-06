import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import JWT from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../Entities/User.entity';
import { IRequest } from '../Controllers/Auth.controller';

dotenv.config();

export interface IOptions {
  financial_year: string;
}
export interface IPayload extends IOptions {
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  tokenVersion: number;
}

export const encryptPassword = async (
  user_password: string
): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(user_password, salt);
  } catch (error) {
    throw error;
  }
};

export const validatePassword = async (
  user: User,
  user_password: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(user_password, user.user_password);
  } catch (error) {
    throw error;
  }
};

export const signAccessToken = async (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET!;
    const issuer = process.env.ISSUER!;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN!;
    const audience = user.user_id;
    const options = {
      expiresIn,
      issuer,
      audience,
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error(err.message);
        //return reject(err);
        return reject(new createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

export const signRefreshToken = async (
  user: User,
  option: IOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {
      tokenVersion: user.user_token_version,
      financial_year: option.financial_year,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET!;
    const issuer = process.env.ISSUER!;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN!;
    const audience = user.user_id;
    const options = {
      expiresIn,
      issuer,
      audience,
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error(err.message);
        //return reject(err);
        return reject(new createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers['authorization'])
      return next(new createError.Unauthorized());
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.split(' ');
    const token = bearerToken[1];
    const secret = process.env.ACCESS_TOKEN_SECRET!;
    JWT.verify(token, secret, (err, payload) => {
      if (err) {
        const message =
          err?.name === 'JsonWebTokenError' ? 'Unauthorized' : err?.message;
        return next(new createError.Unauthorized(message));
      }
      (req as IRequest).payload = payload as IPayload;
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRefreshToken = async (req: Request): Promise<User> => {
  try {
    const refreshToken: string = req.cookies.refreshToken;
    if (!refreshToken) throw new createError.BadRequest();
    const payload = await getPayloadFromRefreshToken(refreshToken);
    const isExpired = Date.now() >= payload.exp * 1000 ? true : false;
    isExpired && (await incrementTokenVersion(payload.aud));
    const user = await verifyRefreshTokenVersion(
      payload.aud,
      payload.tokenVersion
    );
    if (!user) throw new createError.Unauthorized();
    (req as IRequest).payload = payload;
    return user;
  } catch (error) {
    throw error;
  }
};

const getPayloadFromRefreshToken = async (
  refreshToken: string
): Promise<IPayload> => {
  return new Promise((resolve, reject) => {
    const secret = process.env.REFRESH_TOKEN_SECRET!;
    JWT.verify(refreshToken, secret, (err, payload) => {
      if (err) {
        if (err.name !== 'TokenExpiredError')
          reject(new createError.Unauthorized());
        JWT.verify(
          refreshToken,
          secret,
          { ignoreExpiration: true },
          (err, payload) => {
            if (err) reject(new createError.Unauthorized());
            resolve(payload as IPayload);
          }
        );
      }
      resolve(payload as IPayload);
    });
  });
};

const incrementTokenVersion = async (user_id: string): Promise<boolean> => {
  try {
    const user = await getRepository(User).findOne({ where: { user_id } });
    if (!user) return false;
    await getRepository(User).merge(user, {
      user_token_version: user.user_token_version + 1,
    });
    const updatedUser = await getRepository(User).save(user);
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const verifyRefreshTokenVersion = async (
  user_id: string,
  tokenVersion: number
): Promise<User | null> => {
  try {
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.user_password')
      .where('user.user_id=:user_id and user.user_status=:user_status', {
        user_id,
        user_status: true,
      })
      .getOne();
    if (!user) return null;
    if (user.user_token_version !== tokenVersion) return null;
    user.user_password = '';
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
