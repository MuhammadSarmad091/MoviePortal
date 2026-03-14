# Movie Portal Application

A full-stack web application for browsing, managing, and reviewing movies. Built with Vue.js 3 (frontend) and Node.js/Express (backend), with MongoDB for data persistence.

## Features

- 🎬 Browse and search movies
- ⭐ Rate and review movies
- 👤 User authentication (Login/Register)
- 📝 Add, edit, and delete movie reviews
- 🎯 Movie ratings calculated from user reviews
- 🔒 Secure password handling with bcryptjs
- 🛡️ JWT-based authentication
- ✅ Comprehensive unit tests

## Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- Vite (build tool)
- Vue Router (routing)
- Axios (HTTP client)
- FontAwesome 6 (icons)
- Vitest (testing framework)

**Backend:**
- Node.js & Express
- MongoDB (with external URI)
- Mongoose (ODM)
- JWT (authentication)
- bcryptjs (password hashing)
- Jest (testing framework)

## Folder Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose models (Movie, Review, User)
│   │   ├── routes/            # API route definitions
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Express server entry point
│   ├── Dockerfile             # Backend Docker image
│   ├── package.json
│   └── jest.config.js         # Jest test configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   ├── composables/       # Vue composition API hooks
│   │   ├── pages/             # Page components (views)
│   │   │   ├── AuthPages/     # Login/Register pages
│   │   │   ├── HomePage.vue
│   │   │   └── ...
│   │   ├── router/            # Vue Router configuration
│   │   ├── utils/             # Utility functions & validation
│   │   ├── styles/            # CSS files
│   │   ├── App.vue            # Root component
│   │   └── main.js            # Application entry point
│   ├── tests/
│   │   ├── setupTests.js      # Test environment setup
│   │   └── unit/              # Unit tests
│   ├── Dockerfile             # Frontend Docker image
│   ├── nginx.conf             # Nginx configuration for production
│   ├── package.json
│   ├── vite.config.js         # Vite build configuration
│   └── vitest.config.js       # Vitest test configuration
│
├── docker-compose.yml         # Docker Compose configuration
├── .env                       # Environment variables
├── sample.env                 # Sample environment template
└── README.md                  # This file
```

## Setup Instructions

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB URI (for backend connection)
- Docker & Docker Compose (optional, for containerized deployment)

### Environment Configuration

1. Copy `sample.env` to `.env`:
   ```bash
   cp sample.env .env
   ```

2. Update `.env` with your configuration:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   BACKEND_PORT=5000
   NODE_ENV=development
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## Section 1: Running with Docker Compose

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v1.29+)

### Start the Application

```bash
# Build and start all services
docker compose -f docker-compose.yml up -d

# View logs
docker compose logs -f

# View logs from a specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api

### Stop the Application

```bash
# Stop all services
docker compose -f docker-compose.yml down

# Stop and remove volumes
docker compose -f docker-compose.yml down -v
```

### Common Docker Commands

```bash
# Rebuild images without cache
docker compose build --no-cache

# Restart services
docker compose restart

# Check status
docker compose ps
```

---

## Section 2: Manual Setup with npm

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm start

# Start production server
npm start

# Backend will run on: http://localhost:5000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on: http://localhost:5173
```

## Section 3: Running Test Cases

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests once
npm run test

```

**Test Files:** `src/controllers/*.test.js`

**Framework:** Jest

**Features:**
- Unit tests for controllers
- Mocked external dependencies (MongoDB, authentication)
- ~8 test cases covering create, read, update, delete operations

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests once
npm run test

```

**Test Files:** `tests/unit/*.spec.js`

**Framework:** Vitest

**Coverage:**
- Input sanitization tests (8 tests)
- Form validation tests (7 tests)
- LoginPage component tests (4 tests)
- AddEditMovieModal component tests (3 tests)
- Total: 22+ test cases

### View Test Results

Tests output includes:
- Pass/fail status
- Execution time
- Code coverage (when using coverage flag)

Example output:
```
✓ src/unit/validation.spec.js (7)
✓ src/unit/useInputSanitize.spec.js (8)
✓ src/unit/LoginPage.spec.js (4)
✓ src/unit/AddEditMovieModal.spec.js (3)

Test Files  4 passed (4)
Tests      22 passed (22)
```

### Backend Integration Tests

Integration tests validate all API endpoints end-to-end with a real database, including security fixes, race condition prevention, and performance optimizations.

**Prerequisites:**
- Docker installed and running
- 10-15 seconds for test execution

**Run Integration Tests:**

```bash
# Navigate to root directory
cd Task1

# Terminal 1: Start test database with Docker
docker compose -f docker-compose.test.yml up -d

# Terminal 2: Navigate to backend and run tests
cd backend

# Run all integration tests once
npm run test:integration

# Run all tests (unit + integration)
npm run test:all
```

**Stop Test Database:**

```bash
# From root directory
docker-compose -f docker-compose.test.yml down
```

**Integration Test Coverage (42 tests):**

| Test Suite | Tests | Coverage |
|-----------|-------|----------|
| User Authentication | 11 | Registration, login, JWT tokens, token validation |
| Movie CRUD | 15 | Create/read/update/delete, pagination, search, N+1 optimization |
| Review Operations | 16 | CRUD, race condition prevention, rating aggregation |

**Test Highlights:**
- ✅ Race condition prevention - Concurrent requests validated
- ✅ N+1 query fix - Single aggregation pipeline confirmed
- ✅ Authorization checks - Users restricted to own data
- ✅ Pagination limits - MAX 100 enforced
- ✅ Input validation - All field validation tested
- ✅ Rating aggregation - Movie ratings recalculated correctly

**Example Test Output:**

```
PASS  tests/integration/user.test.js (2.5s)
  User Authentication Integration Tests
    ✓ should register new user with valid credentials (45ms)
    ✓ should login user with correct credentials (42ms)
    ... (11 tests total)

PASS  tests/integration/movie.test.js (3.2s)
  Movie CRUD Integration Tests
    ✓ should create movie with valid data (38ms)
    ✓ should fetch movies with efficient aggregation pipeline (52ms)
    ... (15 tests total)

PASS  tests/integration/review.test.js (4.1s)
  Review Integration Tests
    ✓ should create review with valid data (35ms)
    ✓ should prevent duplicate reviews from same user (68ms)
    ... (16 tests total)

Test Suites: 3 passed, 3 total
Tests:       42 passed, 42 total
Time:        12.8s
```

**Testing During Development:**

```bash
# Start MongoDB container once
docker compose -f docker-compose.test.yml up -d

# Run tests in watch mode for continuous testing
cd backend
npm run test:integration:watch

# Make code changes - tests automatically re-run
# Tests complete in ~12-15 seconds

# Stop when done
docker compose -f docker-compose.test.yml down
```

For detailed testing documentation, see [backend/TESTING.md](backend/TESTING.md)

---

## API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user  
- `GET /api/v1/users/profile` - Get current user profile (authenticated)

### Movies
- `GET /api/v1/movies` - Get all movies (with pagination, search, filter)
- `GET /api/v1/movies/:id` - Get single movie details
- `POST /api/v1/movies` - Create movie (authenticated)
- `PUT /api/v1/movies/:id` - Update movie (authenticated, owner only)
- `DELETE /api/v1/movies/:id` - Delete movie (authenticated, owner only)

### Reviews
- `GET /api/v1/reviews` - Get all reviews (with pagination, filters)
- `GET /api/v1/reviews/:id` - Get single review
- `POST /api/v1/reviews` - Create review (authenticated, one review per user per movie)
- `PUT /api/v1/reviews/:id` - Update review (authenticated, owner only)
- `DELETE /api/v1/reviews/:id` - Delete review (authenticated, owner only)

**Note:** Legacy `/api/` endpoints are still supported for backward compatibility but use `/api/v1/` for new development.

---

## Project Highlights

**Security (18 Fixes)**
- Input sanitization to prevent special characters
- JWT-based authentication with token validation
- Password hashing with bcryptjs
- CORS protection with environment-based allowlist
- Helmet security headers (XSS, clickjacking protection)
- Request body size limits (10KB) - prevents DoS
- Compound unique index on reviews (race condition prevention)
- Dockerfile hardening with non-root user
- Database indexes for performance optimization

**Testing**
- 30+ unit tests across frontend and backend
- 42 comprehensive integration tests with Docker MongoDB
- Production-style testing approach with end-to-end validation
- Tests for race conditions, authorization, pagination, and performance
- Real component testing with mocked dependencies
- Watch mode for continuous testing during development

**Performance Optimizations**
- **N+1 Query Fix:** Single aggregation pipeline (20-100x faster for bulk queries)
- **Database Indexes:** Optimized queries on movieId, userId, createdAt
- Pagination limits enforced (MAX 100 results per page)
- Gzip compression in production (Nginx) - 70-80% bandwidth savings
- Optimized Docker images (Alpine-based)
- Caching strategies for static assets
- Centralized configuration management

**Infrastructure**
- Docker Compose with resource limits and health checks
- Automatic service restart on failure
- Database transactions for atomic operations
- API versioning (/api/v1/) for backward compatibility
- Database seeding for consistent test data
- Comprehensive logging and error handling

**UI/UX**
- Golden, rounded login button with hover effects
- Responsive design with FontAwesome icons
- Professional navbar and footer
- Error handling and user feedback

---

## Troubleshooting

### Docker Build Fails
```bash
# Rebuild with no cache
docker compose build --no-cache

# Check logs
docker compose logs backend
```

### Port Already in Use
Edit `docker-compose.yml` to use different ports:
```yaml
ports:
  - "8080:80"    # Frontend on port 8080
  - "5001:5000"  # Backend on port 5001
```

### MongoDB Connection Error
- Verify MongoDB URI in `.env`
- Check internet connection
- Ensure MongoDB cluster is active

### Frontend Tests Fail
```bash
cd frontend
npm install
npm run test
```

### Backend Tests Fail
```bash
cd backend
npm install
npm test
```
