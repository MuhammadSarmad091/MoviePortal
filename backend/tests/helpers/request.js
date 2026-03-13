/**
 * Test HTTP Request Helpers
 * Provides utility functions for making test requests to the API
 */

const request = require('supertest');

/**
 * Create a supertest request wrapper with common headers
 */
function createRequest(app) {
  return {
    /**
     * POST request with JSON body
     */
    post: (path, data = {}, token = null) => {
      let req = request(app)
        .post(path)
        .set('Content-Type', 'application/json');
      
      if (token) {
        req = req.set('Authorization', `Bearer ${token}`);
      }
      
      return req.send(data);
    },
    
    /**
     * GET request with optional token
     */
    get: (path, token = null) => {
      let req = request(app).get(path);
      
      if (token) {
        req = req.set('Authorization', `Bearer ${token}`);
      }
      
      return req;
    },
    
    /**
     * PUT request with JSON body
     */
    put: (path, data = {}, token = null) => {
      let req = request(app)
        .put(path)
        .set('Content-Type', 'application/json');
      
      if (token) {
        req = req.set('Authorization', `Bearer ${token}`);
      }
      
      return req.send(data);
    },
    
    /**
     * DELETE request
     */
    delete: (path, token = null) => {
      let req = request(app).delete(path);
      
      if (token) {
        req = req.set('Authorization', `Bearer ${token}`);
      }
      
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
