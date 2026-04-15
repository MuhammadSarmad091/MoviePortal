const User = require('../models/User');

const findExistingUserByEmailOrUsername = async ({ email, username }) => {
  return User.findOne({
    $or: [{ email }, { username }]
  });
};

const createUser = async ({ username, email, password }) => {
  const user = new User({ username, email, password });
  await user.save();
  return user;
};

const findUserWithPasswordByEmail = async (email) => {
  return User.findOne({ email }).select('+password');
};

const findUserById = async (userId) => {
  return User.findById(userId);
};

module.exports = {
  findExistingUserByEmailOrUsername,
  createUser,
  findUserWithPasswordByEmail,
  findUserById
};
