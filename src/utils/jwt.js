const jwt = require('jsonwebtoken');

exports.generateToken = (accountLogin) => {
  return jwt.sign({
    userId: accountLogin.userId,
    userName: accountLogin.userName,
    accountId: accountLogin.accountId
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Authorization token is required'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const response = {
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    };

    if (error.name === 'TokenExpiredError') {
      response.code = 'TOKEN_EXPIRED';
      response.message = 'Token has expired';
      return res.status(401).json(response);
    }

    res.status(401).json(response);
  }
};
