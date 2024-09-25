import * as bcrypt from 'bcrypt';

export async function encodePassword(password: string): Promise<string> {
  const SALT = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, SALT);
}

export function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compareSync(password, hash);
}
