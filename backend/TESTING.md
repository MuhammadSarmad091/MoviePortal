# Integration Testing Guide

## Quick Start

### 1. Start Test Database
```bash
docker-compose -f docker-compose.test.yml up -d
```

### 2. Run Tests
```bash
cd backend
npm run test:integration
```

### 3. Cleanup
```bash
docker-compose -f docker-compose.test.yml down
```

---

## Test Suites

### User Authentication (11 tests)
- Registration with validation
- Duplicate prevention
- Login and JWT tokens
- Token expiration and invalidation
- Profile endpoint access

**Run only:** `npm run test:integration -- user.test.js`

### Movie CRUD (15 tests)
- Create, read, update, delete operations
- Authorization checks
- Pagination with limit caps
- Search and filtering
- N+1 query performance validation
- Cascading deletes

**Run only:** `npm run test:integration -- movie.test.js`

### Review Operations (16 tests)
- Create, read, update, delete
- Duplicate prevention (race condition test)
- Rating validation (1-5 scale)
- Movie rating aggregation
- Concurrent request handling
- Review statistics calculations

**Run only:** `npm run test:integration -- review.test.js`

---

## Test Coverage

```
User Auth       11 tests  ✅ 100% of auth endpoints
Movie CRUD      15 tests  ✅ 100% of movie operations
Review Ops      16 tests  ✅ 100% of review operations
                --------
Total           42 tests  ✅ Comprehensive coverage
```

---

## Development Workflow

### Watch Mode (Recommended for Development)

```bash
# Terminal 1: MongoDB container
docker-compose -f docker-compose.test.yml up

# Terminal 2: Run tests in watch mode
cd backend
npm run test:integration:watch

# Make changes, tests auto-run
```

### Single Test Run

```bash
npm run test:integration
```

### All Tests (Unit + Integration)

```bash
npm run test:all
```

---

## Performance Notes

| Task | Time |
|------|------|
| Test database startup | ~3-5 seconds |
| Test execution (42 tests) | ~8-12 seconds |
| Full suite with setup | ~15-20 seconds |

---

## CI/CD Integration

Tests are ready for CI/CD pipelines:

**GitHub Actions:**
```yaml
- name: Run integration tests
  run: npm run test:integration
```

**GitLab CI:**
```yaml
test:integration:
  script:
    - npm run test:integration
```

**Jenkins:**
```groovy
stage('Test') {
  steps {
    sh 'npm run test:integration'
  }
}
```

---

## Test Database

**Isolation:** Each test run uses a fresh database
**Cleanup:** Automatic between tests (no manual cleanup needed)
**Data:** Fixtures provide consistent test data

### Manual Database Access

```bash
# Connect to test database while container is running
docker-compose -f docker-compose.test.yml exec mongodb-test mongosh \
  -u testuser -p testpass \
  --authenticationDatabase admin \
  test_db

# List collections
show collections

# Query users
db.users.find().pretty()

# Check indexes
db.reviews.getIndexes()
```

---

## Troubleshooting

### MongoDB Connection Error

```bash
# Check container status
docker-compose -f docker-compose.test.yml ps

# Check logs
docker-compose -f docker-compose.test.yml logs mongodb-test

# Restart
docker-compose -f docker-compose.test.yml restart mongodb-test
```

### Test Timeout

Increase timeout in `backend/jest.config.js`:
```javascript
testTimeout: 60000, // 60 seconds
```

### Port Conflict (27017 already in use)

Edit `docker-compose.test.yml`:
```yaml
mongodb-test:
  ports:
    - "27018:27017"  # Use 27018 instead
```

Update `.env.test`:
```env
MONGODB_URI=mongodb://testuser:testpass@localhost:27018/test_db
```

---

## Key Test Features

✅ **Race Condition Testing**
- Concurrent requests validated
- Unique constraints enforced
- Database atomicity verified

✅ **Performance Validation**
- N+1 query fix confirmed (single aggregation)
- Pagination limits enforced
- Query efficiency validated

✅ **Security Testing**
- Authentication required
- Authorization validated
- Input validation confirmed

✅ **Data Integrity**
- Cascading deletes work correctly
- Transactions maintain consistency
- Rating recalculation accurate

---

## Next Steps

- Run tests regularly during development
- Add custom tests for business logic
- Monitor performance metrics
- Extend tests as features are added

For full documentation, see `SECURITY_FIXES.md` Section 18: Integration Testing
