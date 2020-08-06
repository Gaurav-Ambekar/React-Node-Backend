import { IPayload } from '../../Helpers/jwt_helper';

declare global {
  namespace Express {
    export interface Request {
      payload: IPayload;
    }
  }
}
