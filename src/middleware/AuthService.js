const AuthService = {
  decodeBase64(data) {
    let buff = new Buffer.from(data, 'base64');
    let decoded = buff.toString();
    return decoded.split(':');
  },
  getUser(knex, username) {
    return knex('thingful_users').where('user_name', username).first();
  }
};

module.exports = AuthService;
