import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

export const jwtConfig: {
  secret: string;
  expiresIn: SignOptions['expiresIn'];
} = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: '7d',
};
