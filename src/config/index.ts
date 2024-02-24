import type { CorsOptions } from 'cors';

const whitelistOrigin = ['http://localhost:3000'];

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

export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpire: process.env.JWT_ACCESS_EXPIRE!,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE!,
  },
  hashRounds: 12,
  db: {
    type: 'mysql',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_DATABASE!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
  },
  cors: corsOption,
  isDev: process.env.NODE_ENV === 'development',
  port: process.env.PORT,
});
