const express = require('express');
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// Protected routes for updating/deleting reviews
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
