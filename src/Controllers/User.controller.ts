import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import createError from 'http-errors';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { User } from '../Entities/User.entity';
import { UploadedFile } from 'express-fileupload';
import { IRequest } from './Auth.controller';
import { IMAGE_URL, IMAGE_FOLDER } from '../config/static_link';
dotenv.config();
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const users = await getRepository(User).find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = await getRepository(User).findOne(req.params.id);
    if (!user) throw new createError.NotFound('User not found!!!');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const newUser = getRepository(User).create(req.body);
    const savedUser = await getRepository(User).save(newUser);
    res.json(savedUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = await getRepository(User).findOne(req.params.id);
    if (!user) throw new createError.NotFound('User not found!!!');
    await getRepository(User).merge(user, req.body);
    const updatedUser = await getRepository(User).save(user);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = await getRepository(User).findOne(req.params.id);
    if (!user) throw new createError.NotFound('User not found!!!');
    const deletedUser = await getRepository(User).delete(req.params.id);
    res.json(deletedUser);
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    console.log(req.files);
    if (!req.files) throw new createError.BadRequest();
    const file = req.files.file as UploadedFile;
    const filename = `${new Date().valueOf()}.${path.extname(file.name)}`;
    file.mv(path.join(`${IMAGE_FOLDER}`, `${filename}`), (err) => {
      if (err) {
        console.error(err);
        return next(new createError.InternalServerError());
      }
      (req as IRequest).user_avatar = filename;
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      user_avatar,
      payload: { aud },
    } = req as IRequest;
    const image_url = `${IMAGE_URL}${user_avatar}`;
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.user_password')
      .where('user.user_id=:user_id and user.user_status=:user_status', {
        user_id: aud,
        user_status: true,
      })
      .getOne();
    if (!user) {
      await removeImage(image_url);
      throw new createError.NotFound('User not found!!!');
    }
    await removeImage(user.user_avatar);
    await getRepository(User).merge(user, {
      user_avatar: image_url,
    });
    const updatedUser = await getRepository(User).save(user);
    updatedUser.user_password = '';
    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const removeImage = async (url: string): Promise<void> => {
  try {
    const filename: string | null =
      url.length > 0 ? url.substr(url.lastIndexOf('/') + 1) : null;
    const image_path = path.join(`${IMAGE_FOLDER}`, `${filename}`);
    if (filename && fs.existsSync(image_path)) {
      fs.unlink(image_path, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};
