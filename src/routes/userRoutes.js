const express = require('express');
const UserController = require('../controllers/userController');
const { verifyToken } = require('../utils/jwt');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - password
 *             properties:
 *               emailAddress:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     tags: [Auth]
 *     summary: User logout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/users', UserController.createUser);

/**
 * @swagger
 * /api/users/account/{accountNumber}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by account number
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get('/users/account/:accountNumber', verifyToken, UserController.getUserByAccountNumber);

/**
 * @swagger
 * /api/users/registration/{registrationNumber}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by registration number
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get('/users/registration/:registrationNumber', verifyToken, UserController.getUserByRegistrationNumber);

/**
 * @swagger
 * /api/users/inactive:
 *   get:
 *     tags: [Users]
 *     summary: Get inactive users (last login > 3 days)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inactive users
 */
router.get('/users/inactive', verifyToken, UserController.getInactiveAccounts);

/**
 * @swagger
 * /api/users/{userId}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId', verifyToken, UserController.updateUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId', verifyToken, UserController.deleteUser);

module.exports = router;
