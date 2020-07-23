require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');
const randomBytes = require('random-bytes');
const { env } = process;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const checkPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateAuthToken = (userId, email) => {
  const authToken   = randomBytes(32).toString('hex');
  const tokenSecret = env.AUTH_TOKEN_KEY;
  const tokenExpiry = eval(env.AUTH_TOKEN_EXPIRY) + 's';
  const tokenData   = { userId, email, authToken };
  const signedToken = jwt.sign(tokenData, tokenSecret, {expiresIn: tokenExpiry});

  return { token: signedToken, expiry: tokenExpiry };
};

const verifyAuthToken = async (token) => {
  const tokenSecret = env.AUTH_TOKEN_KEY;
  const decoded = await jwt.verify(token, tokenSecret);

  return decoded;
};

module.exports = {
  hashPassword,
  checkPassword,
  generateAuthToken,
  verifyAuthToken,
};
