import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  profile,
  logout,
} from '../Controllers/Auth.controller';
import { verifyAccessToken } from '../Helpers/jwt_helper';

const router: Router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/refresh-token', refreshToken);
router.get('/profile', verifyAccessToken, profile);
router.delete('/logout', logout);

export default router;
