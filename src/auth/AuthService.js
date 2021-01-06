const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const AuthService = {
  decodeBase64(data) {
    let buff = new Buffer.from(data, 'base64');
    let decoded = buff.toString();
    return decoded.split(':');
  },
  getUser(knex, username) {
    return knex('thingful_users').where('user_name', username).first();
  },
  comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJWT(user) {
    return jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
      subject: user.user_name,
      algorithm: 'HS256'
    });
  },
  verifyJWT(token) {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  }
};

module.exports = AuthService;
