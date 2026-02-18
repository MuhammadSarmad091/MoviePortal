const mockFindOne = jest.fn();
const mockSave = jest.fn();

jest.mock('../models/Movie', () => {
  const Movie = function (data) {
    this._id = 'mid';
    this.title = data.title;
    this.description = data.description;
    this.userId = data.userId;
    this.save = mockSave;
  };
  Movie.findOne = mockFindOne;
  Movie.find = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) });
  Movie.countDocuments = jest.fn().mockResolvedValue(0);
  return Movie;
});

const {
  createMovie,
  getAllMovies
} = require('./movieController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('movieController.createMovie', () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockSave.mockReset();
  });

  test('returns 400 when duplicate title exists', async () => {
    mockFindOne.mockResolvedValueOnce({ title: 'X' });

    const req = { body: { title: 'X', description: 'd', releaseDate: '2020-01-01', posterUrl: 'p', trailerUrl: 't' }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createMovie(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie with this title already exists' });
  });

  test('creates movie successfully', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    mockSave.mockResolvedValueOnce();

    const req = { body: { title: 'Y', description: 'd', releaseDate: '2020-01-01', posterUrl: 'p', trailerUrl: 't' }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createMovie(req, res, next);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});
