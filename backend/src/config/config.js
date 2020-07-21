require('dotenv').config();
const { env } = process;
const mongoDSN = env.MONGODB_USERNAME.trim().length > 0
  ? `mongodb://${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@${env.MONGODB_HOST}:${env.MONGODB_PORT}/${env.MONGODB_DBNAME}`
  : `mongodb://${env.MONGODB_HOST}:${env.MONGODB_PORT}/${env.MONGODB_DBNAME}`;

module.exports = {
  applicationName: env.APP_NAME,
  apiVersion: env.API_VERSION,
  port: env.PORT || 3000,
  mongodb: { dsn: mongoDSN, debug: env.MONGOOSE_DEBUG },
};
