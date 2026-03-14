/**
 * Jest Global Setup
 * Runs before all tests to set up the test environment
 */

// Set NODE_ENV to test before any modules are loaded
process.env.NODE_ENV = 'test';

// Load test environment variables
require('dotenv').config({ path: '.env.test' });
