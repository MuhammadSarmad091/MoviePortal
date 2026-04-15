const mockCreateReviewForMovie = jest.fn();

jest.mock('../services/reviewService', () => ({
  createReviewForMovie: mockCreateReviewForMovie,
  getReviewsForMovie: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn()
}));

const { getReviewsForMovie, createReviewForMovie } = require('./reviewController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('reviewController.createReviewForMovie', () => {
  beforeEach(() => {
    mockCreateReviewForMovie.mockReset();
  });

  test('returns 404 when movie not found', async () => {
    mockCreateReviewForMovie.mockResolvedValueOnce({ status: 'MOVIE_NOT_FOUND' });

    const req = { params: { id: 'm1' }, body: { content: 'great movie', rating: 8 }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createReviewForMovie(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  test('creates review when movie exists', async () => {
    mockCreateReviewForMovie.mockResolvedValueOnce({ status: 'OK', review: { _id: 'r1' } });

    const req = { params: { id: 'm1' }, body: { content: 'great movie', rating: 8 }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createReviewForMovie(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test('forwards DB failure to error middleware', async () => {
    const dbError = new Error('db failure');
    mockCreateReviewForMovie.mockRejectedValueOnce(dbError);
    const req = { params: { id: 'm1' }, body: { content: 'great movie', rating: 8 }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createReviewForMovie(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
