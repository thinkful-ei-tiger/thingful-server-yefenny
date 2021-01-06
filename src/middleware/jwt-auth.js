const AuthService = require('../auth/AuthService');
async function requireAuth(req, res, next) {
  const token = req.header('Authorization') || ' ';
  if (!token.toLowerCase().startsWith('bearer')) {
    return res.status(401).json({ error: 'missing bearer token' });
  }
  const jwtToken = token.split(' ')[1] || '';
  try {
    const payload = AuthService.verifyJWT(jwtToken);
    AuthService.getUser(req.app.get('db'), payload.sub).then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'unauthorized request' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'unauthorized request' });
  }
}
module.exports = requireAuth;
