import * as bcrypt from 'bcrypt';

export class HashUtil {
  static hash(data: string) {
    return bcrypt.hash(data, 10);
  }

  static compare(data: string, hash: string) {
    return bcrypt.compare(data, hash);
  }
}
