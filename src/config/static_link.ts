import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

export const IMAGE_FOLDER = path.resolve('public', 'uploads', 'profile');
export const IMAGE_URL = `${process.env.BACKEND_URL}/profile/`;
