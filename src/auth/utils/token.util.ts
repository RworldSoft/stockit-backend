import * as jwt from 'jsonwebtoken';

export class TokenUtil {
  static generateAccessToken(payload: any) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  static generateRefreshToken(payload: any) {
    return jwt.sign(payload, process.env.JWT_RT_SECRET, {
      expiresIn: '7d',
    });
  }
}
