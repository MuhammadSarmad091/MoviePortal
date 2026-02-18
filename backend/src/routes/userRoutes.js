const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const { validateUserInput, validateLoginInput } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUserInput, register);
router.post('/login', validateLoginInput, login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
