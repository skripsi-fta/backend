import type { CorsOptions } from 'cors';

const { env } = process;
const whitelistOrigin = ['http://localhost:3000', 'http://192.168.1.69:3000'];

const corsOption: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || !whitelistOrigin.includes(origin)) {
      return callback(null, false);
    }

    return callback(null, origin);
  },
  optionsSuccessStatus: 200,
  preflightContinue: true,
  credentials: true,
};

const config = {
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET!,
    refreshSecret: env.JWT_REFRESH_SECRET!,
    accessExpire: env.JWT_ACCESS_EXPIRE!,
    refreshExpire: env.JWT_REFRESH_EXPIRE!,
  },
  hashRounds: 12,
  db: {
    host: env.DB_HOST!,
    port: parseInt(env.DB_PORT!),
    database: env.DB_DATABASE!,
    username: env.DB_USERNAME!,
    password: env.DB_PASSWORD!,
  },
  cors: corsOption,
  isDev: env.NODE_ENV === 'development',
  port: env.PORT,
};

export default (): typeof config => config;
