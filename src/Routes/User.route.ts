import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage,
  updateUserImage,
} from '../Controllers/User.controller';
import { verifyAccessToken } from '../Helpers/jwt_helper';

const router: Router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/upload', verifyAccessToken, uploadImage, updateUserImage);

export default router;
