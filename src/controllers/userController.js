const User = require('../models/User');
const AccountLogin = require('../models/AccountLogin');
const { CacheService } = require('../services/cacheService');
const bcrypt = require('bcryptjs');

class UserController {
  static async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      
      // Create associated account login
      const accountLogin = new AccountLogin({
        accountId: `acc_${Date.now()}`,
        userName: req.body.userName || req.body.emailAddress.split('@')[0],
        password: await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS || '8')),
        userId: user.userId
      });
      await accountLogin.save();

      // Cache the user data
      CacheService.cacheUser(user);

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            userId: user.userId,
            fullName: user.fullName,
            emailAddress: user.emailAddress
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: error.message
      });
    }
  }

  static async getUserByAccountNumber(req, res) {
    try {
      // Check cache first
      const cachedUser = await CacheService.getByAccountNumber(req.params.accountNumber);
      if (cachedUser) {
        return res.json({
          status: 'success',
          data: { user: cachedUser }
        });
      }

      const user = await User.findOne({ accountNumber: req.params.accountNumber });
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Cache the user data
      await CacheService.cacheUser(user);

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  }

  static async getUserByRegistrationNumber(req, res) {
    try {
      // Check cache first
      const cachedUser = await CacheService.getByRegistrationNumber(req.params.registrationNumber);
      if (cachedUser) {
        return res.json({
          status: 'success',
          data: { user: cachedUser }
        });
      }

      const user = await User.findOne({ registrationNumber: req.params.registrationNumber });
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Cache the user data
      await CacheService.cacheUser(user);

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  }

  static async getInactiveAccounts(req, res) {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const inactiveAccounts = await AccountLogin.find({
        lastLoginDateTime: { $lt: threeDaysAgo }
      }).populate('user');

      res.json({
        status: 'success',
        data: { accounts: inactiveAccounts }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        { userId: req.params.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Update cache
      await CacheService.cacheUser(user);

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: error.message
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const user = await User.findOneAndDelete({ userId: req.params.userId });
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Delete account login
      await AccountLogin.findOneAndDelete({ userId: user.userId });

      // Clear cache
      await CacheService.clearUserCache(user);

      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  }
}

module.exports = UserController;
