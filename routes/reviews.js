const express = require('express');
const { isLoggedIn, validateReview, wrapAsync, isReviewAuthor } = require('../middleware')
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews')

router.route('/')
    .get(reviews.campgroundRedirect)
    .post(isLoggedIn, validateReview, wrapAsync(reviews.submitReview))

router.delete('/:_idReview', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))

module.exports = router;