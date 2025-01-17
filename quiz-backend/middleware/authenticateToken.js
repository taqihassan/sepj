const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Ersetze durch deinen tatsächlichen Schlüssel

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Kein Token bereitgestellt' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token ungültig' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
