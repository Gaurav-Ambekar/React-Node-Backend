import { Response, Request } from 'express';

export const sendRefreshToken = (res: Response, token: string) => {
  const maxAge = 7 * 24 * 60 * 60;
  res.cookie('refreshToken', token, {
    httpOnly: true,
    maxAge,
    secure: process.env.NODE_ENV === 'production' ? true : false,
  });
};
export const removeRefreshToken = (res: Response) => {
  res.clearCookie('refreshToken');
};
export const isRefreshTokenExist = (req: Request): boolean => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return false;
  return true;
};
