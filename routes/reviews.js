const express = require('express');
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const Cat = require('../models/cat');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');
const review = require('../models/review');

router.post('/', validateReview, isLoggedIn, upload.single('image'), catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;