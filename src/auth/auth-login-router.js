const express = require('express');
const authRouter = express.Router();
const AuthService = require('./AuthService');
authRouter.route('/').post(express.json(), (req, res, next) => {
  const { user_name, password } = req.body;
  const db = req.app.get('db');

  const requiredFields = { user_name, password };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ error: `Missing ${key}` });
    }
  }
  AuthService.getUser(db, user_name)
    .then((user) => {
      if (!user)
        return res
          .status(401)
          .json({ error: 'incorrect user_name or password' });

      return AuthService.comparePassword(password, user.password).then(
        (match) => {
          if (!match) {
            return res
              .status(401)
              .json({ error: 'incorrect user_name or password' });
          }

          res.send({
            authToken: AuthService.createJWT(user)
          });
        }
      );
    })
    .catch(next);
});

module.exports = authRouter;
