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
docker-compose up -d

# View logs
docker-compose logs -f

# View logs from a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api

### Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```


## Section 2: Manual Setup with npm

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev

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

### Access the Application

- **Frontend (dev)**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

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

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Movies
- `GET /api/movies` - Get all movies (with pagination)
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie (authenticated)
- `PUT /api/movies/:id` - Update movie (authenticated)
- `DELETE /api/movies/:id` - Delete movie (authenticated)

### Reviews
- `GET /api/movies/:id/reviews` - Get reviews for a movie
- `POST /api/movies/:id/reviews` - Create review (authenticated)
- `PUT /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)

---

## Project Highlights

**Security**
- Input sanitization to prevent special characters
- JWT-based authentication
- Password hashing with bcryptjs
- CORS enabled

**Testing**
- 30+ unit tests across frontend and backend
- Production-style testing approach
- Real component testing with mocked dependencies

**UI/UX**
- Golden, rounded login button with hover effects
- Responsive design with FontAwesome icons
- Professional navbar and footer
- Error handling and user feedback

**Performance**
- Gzip compression in production (Nginx)
- Optimized Docker images (Alpine-based)
- Caching strategies for static assets

---

## Troubleshooting

### Docker Build Fails
```bash
# Rebuild with no cache
docker-compose build --no-cache

# Check logs
docker-compose logs backend
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
