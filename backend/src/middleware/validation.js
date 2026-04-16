const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
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

  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Username, email, and password must be strings' });
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

  if (username.length > 30) {
    return res.status(400).json({ message: 'Username must not exceed 30 characters' });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  const missingFields = validateRequired(['email', 'password'], req.body);
  if (missingFields) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password must be strings' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
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

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title must be a non-empty string' });
  }
  if (title.length > 200) {
    return res.status(400).json({ message: 'Title must not exceed 200 characters' });
  }

  if (typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ message: 'Description must be a non-empty string' });
  }
  if (description.length > 5000) {
    return res.status(400).json({ message: 'Description must not exceed 5000 characters' });
  }

  if (isNaN(Date.parse(releaseDate))) {
    return res.status(400).json({ message: 'Invalid release date format' });
  }

  if (typeof posterUrl !== 'string' || !isValidUrl(posterUrl)) {
    return res.status(400).json({ message: 'Poster URL must be a valid URL' });
  }

  if (typeof trailerUrl !== 'string' || !isValidUrl(trailerUrl)) {
    return res.status(400).json({ message: 'Trailer URL must be a valid URL' });
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

  if (typeof content !== 'string') {
    return res.status(400).json({ message: 'Review content must be a string' });
  }

  if (content.length < 10) {
    return res.status(400).json({ message: 'Review must be at least 10 characters long' });
  }

  if (content.length > 2000) {
    return res.status(400).json({ message: 'Review must not exceed 2000 characters' });
  }

  const numRating = Number(rating);
  if (!Number.isFinite(numRating) || numRating < 1 || numRating > 10) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 10' });
  }

  req.body.rating = numRating;

  next();
};

module.exports = {
  validateEmail,
  validateRequired,
  isValidUrl,
  validateUserInput,
  validateLoginInput,
  validateMovieInput,
  validateReviewInput
};
