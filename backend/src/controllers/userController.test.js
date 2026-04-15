const mockFindExisting = jest.fn();
const mockCreateUser = jest.fn();
const mockFindWithPassword = jest.fn();

jest.mock('../services/userService', () => ({
  findExistingUserByEmailOrUsername: mockFindExisting,
  createUser: mockCreateUser,
  findUserWithPasswordByEmail: mockFindWithPassword,
  findUserById: jest.fn()
}));

jest.mock('../utils/jwt', () => ({
  generateToken: jest.fn(() => 'mocked-token')
}));

const { register, login } = require('./userController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController.register', () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
    mockFindExisting.mockReset();
  });

  test('returns 400 when user already exists by email', async () => {
    mockFindExisting.mockResolvedValueOnce({ email: 'a@a.com' });

    const req = { body: { username: 'u', email: 'a@a.com', password: 'secret' } };
    const res = makeRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
  });

  test('registers a new user and returns user payload', async () => {
    mockFindExisting.mockResolvedValueOnce(null);
    mockCreateUser.mockResolvedValueOnce({ _id: 'mockedUserId', username: 'newuser' });

    const req = { body: { username: 'newuser', email: 'new@a.com', password: 'secret' } };
    const res = makeRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(mockCreateUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('User registered successfully');
    expect(payload.data).toHaveProperty('userId', 'mockedUserId');
  });
});

describe('userController.login', () => {
  beforeEach(() => {
    mockFindWithPassword.mockReset();
  });

  test('returns 401 for invalid credentials', async () => {
    mockFindWithPassword.mockResolvedValue(null);

    const req = { body: { email: 'no@user.com', password: 'pw' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  test('returns user payload on successful login', async () => {
    const userObj = {
      _id: 'id1',
      username: 'u1',
      email: 'u1@a.com',
      matchPassword: jest.fn().mockResolvedValue(true)
    };
    mockFindWithPassword.mockResolvedValue(userObj);

    const req = { body: { email: 'u1@a.com', password: 'pw' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Login successful');
    expect(payload.data).toHaveProperty('userId', 'id1');
  });

  test('forwards DB failure to error middleware', async () => {
    const dbError = new Error('db failure');
    mockFindWithPassword.mockRejectedValueOnce(dbError);

    const req = { body: { email: 'u1@a.com', password: 'pw' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
