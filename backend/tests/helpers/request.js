/**
 * Test HTTP Request Helpers
 * Provides utility functions for making test requests to the API.
 * Auth tokens are sent as httpOnly cookies (matching production behaviour).
 */

const request = require('supertest');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';

function setAuthCookie(req, token) {
  if (token) {
    req = req.set('Cookie', `${AUTH_COOKIE_NAME}=${token}`);
  }
  return req;
}

/**
 * Create a supertest request wrapper with common headers.
 * When a token is provided it is sent as a cookie, not a Bearer header.
 */
function createRequest(app) {
  return {
    post: (path, data = {}, token = null) => {
      let req = request(app)
        .post(path)
        .set('Content-Type', 'application/json');

      req = setAuthCookie(req, token);
      return req.send(data);
    },

    get: (path, token = null) => {
      let req = request(app).get(path);
      req = setAuthCookie(req, token);
      return req;
    },

    put: (path, data = {}, token = null) => {
      let req = request(app)
        .put(path)
        .set('Content-Type', 'application/json');

      req = setAuthCookie(req, token);
      return req.send(data);
    },

    delete: (path, token = null) => {
      let req = request(app).delete(path);
      req = setAuthCookie(req, token);
      return req;
    }
  };
}

/**
 * Assert response status and content type
 */
function assertResponse(response, expectedStatus, expectedContentType = 'json') {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}. ` +
      `Response: ${JSON.stringify(response.body)}`
    );
  }

  if (expectedContentType === 'json') {
    if (!response.headers['content-type'].includes('application/json')) {
      throw new Error(
        `Expected JSON content type but got ${response.headers['content-type']}`
      );
    }
  }

  return response;
}

/**
 * Extract data from paginated response
 */
function extractPaginatedData(response) {
  return {
    data: response.body.data,
    pagination: response.body.pagination,
    total: response.body.pagination?.total
  };
}

module.exports = {
  createRequest,
  assertResponse,
  extractPaginatedData
};
