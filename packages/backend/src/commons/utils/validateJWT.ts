import { JwtPayload } from '@commons/types';
import * as jwt from 'jsonwebtoken';

export const validateJWT = async (
  token: string
): Promise<JwtPayload | null> => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    return null;
  }
};
