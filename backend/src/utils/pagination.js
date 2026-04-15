const MAX_PAGE = 1000;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

const validatePagination = (page, limit) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  return {
    page: Math.max(1, Math.min(Number.isNaN(parsedPage) ? 1 : parsedPage, MAX_PAGE)),
    limit: Math.max(1, Math.min(Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit, MAX_LIMIT))
  };
};

module.exports = {
  validatePagination,
  MAX_PAGE,
  MAX_LIMIT,
  DEFAULT_LIMIT
};
