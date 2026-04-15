const express = require('express');
const { register, login, logout, getCurrentUser } = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const { validateUserInput, validateLoginInput } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUserInput, register);
router.post('/login', validateLoginInput, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.get('/profile', authenticate, getCurrentUser);

module.exports = router;
