// Movie form validation utility
export function validateMovieForm(form) {
  const errors = {};

  // Title validation
  if (!form.title?.trim()) {
    errors.title = 'Title is required';
  } else if (form.title.length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }

  // Description validation
  if (!form.description?.trim()) {
    errors.description = 'Description is required';
  } else if (form.description.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  // Release date validation
  if (!form.releaseDate) {
    errors.releaseDate = 'Release date is required';
  }

  // Poster URL validation
  if (!form.posterUrl?.trim()) {
    errors.posterUrl = 'Poster URL is required';
  } else if (!isValidUrl(form.posterUrl)) {
    errors.posterUrl = 'Please enter a valid URL';
  }

  // Trailer URL validation
  if (!form.trailerUrl?.trim()) {
    errors.trailerUrl = 'Trailer URL is required';
  } else if (!isValidUrl(form.trailerUrl)) {
    errors.trailerUrl = 'Please enter a valid URL';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Login form validation utility
export function validateLoginForm(form) {
  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Helper to validate URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
