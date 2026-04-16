const { generateToken } = require('../utils/jwt');
const userService = require('../services/userService');
const { config } = require('../config/environment');

const setAuthCookie = (res, token) => {
  res.cookie(config.authCookie.name, token, {
    httpOnly: true,
    secure: config.server.isProduction ? true : config.authCookie.secure,
    sameSite: config.authCookie.sameSite,
    maxAge: config.authCookie.maxAgeMs,
    path: '/'
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(config.authCookie.name, {
    httpOnly: true,
    secure: config.server.isProduction ? true : config.authCookie.secure,
    sameSite: config.authCookie.sameSite,
    path: '/'
  });
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userService.findExistingUserByEmailOrUsername({ email, username });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Create new user
    const user = await userService.createUser({ username, email, password });

    // Generate token
    const token = generateToken(user._id);

    setAuthCookie(res, token);
    res.status(201).json({
      message: 'User registered successfully',
      data: {
        userId: user._id,
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userService.findUserWithPasswordByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    setAuthCookie(res, token);
    res.json({
      message: 'Login successful',
      data: {
        userId: user._id,
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
