const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockSave = jest.fn();

jest.mock('../models/Movie', () => ({ findById: mockFindById, findByIdAndUpdate: mockFindByIdAndUpdate }));

jest.mock('../models/Review', () => {
  const Review = function (data) {
    this.content = data.content;
    this.rating = data.rating;
    this.movieId = data.movieId;
    this.userId = data.userId;
    this.save = mockSave;
  };
  Review.find = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([]) });
  Review.countDocuments = jest.fn().mockResolvedValue(0);
  Review.aggregate = jest.fn().mockResolvedValue([]);
  return Review;
});

const { getReviewsForMovie, createReviewForMovie } = require('./reviewController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('reviewController.createReviewForMovie', () => {
  beforeEach(() => {
    mockFindById.mockReset();
    mockSave.mockReset();
  });

  test('returns 404 when movie not found', async () => {
    mockFindById.mockResolvedValueOnce(null);

    const req = { params: { id: 'm1' }, body: { content: 'great movie', rating: 8 }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createReviewForMovie(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
  });

  test('creates review when movie exists', async () => {
    mockFindById.mockResolvedValueOnce({ _id: 'm1' });
    mockSave.mockResolvedValueOnce();

    const req = { params: { id: 'm1' }, body: { content: 'great movie', rating: 8 }, userId: 'u1' };
    const res = makeRes();
    const next = jest.fn();

    await createReviewForMovie(req, res, next);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});
