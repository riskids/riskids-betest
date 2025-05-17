const logger = require('../utils/logger');
const AccountLogin = require('../models/AccountLogin');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const INVALID_CREDENTIALS_RESPONSE = {
  status: 'error',
  code: 'INVALID_CREDENTIALS',
  message: 'Invalid username or password'
};

exports.login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    
    // Try finding user by email
    const user = await User.findOne({ emailAddress: emailAddress });
    
    // Find account login by userName or email
    let accountLogin = await AccountLogin.findOne({ emailAddress });
    if (!accountLogin) {
      if (user) {
        accountLogin = await AccountLogin.findOne({ userId: user._id });
        console.log(accountLogin)
      }
      if (!accountLogin) {
        console.log("ga lolo account login")
        return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
      }
    }

    // Validate password
    // Normalize bcrypt hash version for comparison
    const normalizedHash = accountLogin.password
      .replace(/^\$2[ay]\$/, '$2a$')
      .replace(/^\$2b\$/, '$2a$');
    const isMatch = await bcrypt.compare(password, normalizedHash);
    if (!isMatch) {
      console.log("ga lolo password")
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    // Update last login time
    accountLogin.lastLoginDateTime = new Date();
    await accountLogin.save();

    // Generate token
    const token = generateToken(accountLogin);

    res.json({
      status: 'success',
      data: {
        user: {
          userId: user._id,
          fullName: user.fullName,
          emailAddress: user.emailAddress
        },
        token
      }
    });
  } catch (error) {
    logger.error({
      message: 'Login error',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { accountId } = req.user;

    // Update last login time
    await AccountLogin.findOneAndUpdate(
      { accountId },
      { $set: { lastLoginDateTime: new Date() } }
    );

    res.json({ 
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error({
      message: 'Logout error', 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};
