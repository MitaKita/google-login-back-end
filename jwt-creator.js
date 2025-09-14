const jwt = require('jsonwebtoken');

const getToken = (userId, email) => {
  const payload = { userId, email };
  const secret = 'your_jwt_secret'; // use a strong secret in production
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

module.exports = { getToken };