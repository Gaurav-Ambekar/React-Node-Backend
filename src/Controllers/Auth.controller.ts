import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { getRepository } from 'typeorm';
import { User } from '../Entities/User.entity';
import { removeRefreshToken, sendRefreshToken } from '../Helpers/browserCookie';
import {
  encryptPassword,
  signAccessToken,
  signRefreshToken,
  validatePassword,
  verifyRefreshToken,
  IPayload,
} from '../Helpers/jwt_helper';
import { loginSchema, registerSchema } from '../Helpers/validation_schema';
export interface ILoginForm {
  financial_year: string;
  user_name: string;
  user_password: string;
}
export interface IRequest extends Request {
  payload: IPayload;
  user_avatar?: string;
}
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedUser: User = await registerSchema.validateAsync(req.body);
    const doesExist = await getRepository(User).findOne({
      where: { user_name: validatedUser.user_name },
    });
    if (doesExist)
      throw new createError.Conflict(
        `${validatedUser.user_name} is already been registered.`
      );
    const newUser = getRepository(User).create(validatedUser);
    newUser.user_password = await encryptPassword(newUser.user_password);
    const savedUser = await getRepository(User).save(newUser);
    const accessToken = await signAccessToken(savedUser);
    const refreshToken = await signRefreshToken(savedUser, {
      financial_year: '',
    });
    sendRefreshToken(res, refreshToken);
    res.json({ loggedUser: savedUser, token: accessToken });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const validatedUser: ILoginForm = await loginSchema.validateAsync(req.body);
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.user_password')
      .where('user.user_name=:user_name and user.user_status=:user_status', {
        user_name: validatedUser.user_name,
        user_status: true,
      })
      .getOne();
    if (!user) throw new createError.NotFound('Invalid Credentials!!!');
    const isMatch = await validatePassword(user, validatedUser.user_password);
    if (!isMatch) throw new createError.Unauthorized('Invalid Credentials!!!');
    user.user_password = '';

    const accessToken = await signAccessToken(user);
    const refreshToken = await signRefreshToken(user, {
      financial_year: validatedUser.financial_year,
    });
    sendRefreshToken(res, refreshToken);
    res.json({
      user,
      token: accessToken,
      financial_year: validatedUser.financial_year,
    });
  } catch (error) {
    if (error.isJoi === true)
      return next(new createError.BadRequest('Invalid Credentials!!!'));
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = await verifyRefreshToken(req);
    const financial_year = (req as IRequest).payload.financial_year;
    const accessToken = await signAccessToken(user);
    const newRefreshToken = await signRefreshToken(user, {
      financial_year,
    });
    sendRefreshToken(res, newRefreshToken);
    res.json({
      user,
      token: accessToken,
      financial_year,
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    res.json('Profile');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = await verifyRefreshToken(req);
    removeRefreshToken(res);
    res.json(true);
  } catch (error) {
    next(error);
  }
};
