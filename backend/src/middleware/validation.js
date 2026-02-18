const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validateRequired = (fields, data) => {
  const missing = [];
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      missing.push(field);
    }
  });
  return missing.length > 0 ? missing : null;
};

const validateUserInput = (req, res, next) => {
  const { username, email, password } = req.body;
  
  const missingFields = validateRequired(['username', 'email', 'password'], req.body);
  if (missingFields) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });
  }

  next();
};

const validateMovieInput = (req, res, next) => {
  const { title, description, releaseDate, posterUrl, trailerUrl } = req.body;
  
  const missingFields = validateRequired(['title', 'description', 'releaseDate', 'posterUrl', 'trailerUrl'], req.body);
  if (missingFields) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  next();
};

const validateReviewInput = (req, res, next) => {
  const { content, rating } = req.body;
  
  const missingFields = validateRequired(['content', 'rating'], req.body);
  if (missingFields) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  if (content.length < 10) {
    return res.status(400).json({ message: 'Review must be at least 10 characters long' });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ message: 'Rating must be between 1 and 10' });
  }

  next();
};

module.exports = {
  validateEmail,
  validateRequired,
  validateUserInput,
  validateMovieInput,
  validateReviewInput
};
