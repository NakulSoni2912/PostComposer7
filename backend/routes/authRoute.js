/**
 * @file authRoute.js
 * @description Defines Express routes for Twitter User Authentication.
 * Maps endpoints to authController logic.
 */

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
router.post("/register", authController.signup);
// Register new user: POST /api/auth/signup
router.post('/signup', authController.signup);

// Validate if email is available: POST /api/auth/signup/email
router.post('/signup/email', authController.signupEmail);

// User login: POST /api/auth/login
router.post('/login', authController.login);

// Request password reset link: POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);


module.exports = router;
