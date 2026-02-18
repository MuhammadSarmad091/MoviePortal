const mockSave = jest.fn();
const mockFindOne = jest.fn();

jest.mock('../models/User', () => {
  const User = function (data) {
    this._id = 'mockedUserId';
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.save = mockSave;
  };
  User.findOne = mockFindOne;
  return User;
});

jest.mock('../utils/jwt', () => ({
  generateToken: jest.fn(() => 'mocked-token')
}));

const { register, login } = require('./userController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController.register', () => {
  beforeEach(() => {
    mockSave.mockReset();
    mockFindOne.mockReset();
  });

  test('returns 400 when user already exists by email', async () => {
    mockFindOne.mockResolvedValueOnce({ email: 'a@a.com' });

    const req = { body: { username: 'u', email: 'a@a.com', password: 'secret' } };
    const res = makeRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
  });

  test('registers a new user and returns token and user', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    mockSave.mockResolvedValueOnce();

    const req = { body: { username: 'newuser', email: 'new@a.com', password: 'secret' } };
    const res = makeRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('token', 'mocked-token');
    expect(payload.user).toMatchObject({ username: 'newuser', email: 'new@a.com' });
  });
});

describe('userController.login', () => {
  beforeEach(() => {
    mockFindOne.mockReset();
  });

  test('returns 401 for invalid credentials', async () => {
    // simulate findOne().select() returning null
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const req = { body: { email: 'no@user.com', password: 'pw' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  test('returns token and user on successful login', async () => {
    const userObj = {
      _id: 'id1',
      username: 'u1',
      email: 'u1@a.com',
      matchPassword: jest.fn().mockResolvedValue(true)
    };
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(userObj) });

    const req = { body: { email: 'u1@a.com', password: 'pw' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('token', 'mocked-token');
    expect(payload.user).toMatchObject({ username: 'u1', email: 'u1@a.com' });
  });
});
