const mockCreateMovie = jest.fn();

jest.mock('../services/movieService', () => ({
  createMovie: mockCreateMovie
}));

const {
  createMovie
} = require('./movieController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('movieController.createMovie', () => {
  beforeEach(() => {
    mockCreateMovie.mockReset();
  });

  test('creates movie successfully', async () => {
    mockCreateMovie.mockResolvedValueOnce({ _id: 'mid', title: 'Y' });
    const req = { body: { title: 'Y', description: 'd', releaseDate: '2020-01-01', posterUrl: 'p', trailerUrl: 't' }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createMovie(req, res, next);

    expect(mockCreateMovie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test('forwards DB/save failure to error middleware', async () => {
    const dbError = new Error('save failed');
    mockCreateMovie.mockRejectedValueOnce(dbError);
    const req = { body: { title: 'Y', description: 'd', releaseDate: '2020-01-01', posterUrl: 'p', trailerUrl: 't' }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createMovie(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
