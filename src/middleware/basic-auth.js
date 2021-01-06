const AuthService = require('../auth/AuthService');
const bcrypt = require('bcryptjs');
function requireAuth(req, res, next) {
  const token = req.get('Authorization') || ' ';
  if (!token || !token.toLowerCase().startsWith('basic')) {
    return res.status(401).json({ error: 'missing basic token' });
  }

  let toDecode = token.split(' ');
  toDecode = toDecode.length > 1 ? token.split(' ')[1] : ' ';
  let [username, password] = AuthService.decodeBase64(toDecode);
  if (!username || !password) {
    return res.status(401).json({ error: 'unauthorized request' });
  }

  AuthService.getUser(req.app.get('db'), username)
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'unauthorized request' });
      }
      req.user = user;
      next();
    })
    .catch(next);
}

module.exports = requireAuth;
