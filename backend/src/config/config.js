require('dotenv').config();
const { env } = process;

module.exports = {
  applicationName: env.APP_NAME,
  apiVersion: env.API_VERSION,
  port: env.PORT || 3000,
};
