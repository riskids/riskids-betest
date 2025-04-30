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
    
    // Find account login by userName or email
    let accountLogin = await AccountLogin.findOne({ emailAddress });
    if (!accountLogin) {
      // Try finding user by email
      const user = await User.findOne({ emailAddress: emailAddress });
      if (user) {
        accountLogin = await AccountLogin.findOne({ userId: user.userId });
      }
      if (!accountLogin) {
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
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    // Update last login time
    accountLogin.lastLoginDateTime = new Date();
    await accountLogin.save();

    // Get user info
    const user = await User.findOne({ userId: accountLogin.userId });
    if (!user) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    // Generate token
    const token = generateToken(accountLogin);

    res.json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          fullName: user.fullName,
          emailAddress: user.emailAddress
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
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
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};
