export function sanitizeUsername(input) {
  if (!input) return '';
  // Allow letters, numbers, underscore and hyphen only
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function sanitizeEmail(input) {
  if (!input) return '';
  // Allow common email characters: letters, numbers, @, ., -, _, +
  return input.replace(/[^a-zA-Z0-9@._+-]/g, '');
}

export default {
  sanitizeUsername,
  sanitizeEmail
};
