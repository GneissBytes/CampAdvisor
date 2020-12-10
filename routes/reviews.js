const express = require('express');
const { isLoggedIn, validateReview, wrapAsync, isReviewAuthor, canAddReview , isAdmin} = require('../middleware')
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews')

router.route('/')
    .get(reviews.campgroundRedirect)
    .post(isLoggedIn, validateReview, wrapAsync(canAddReview), wrapAsync(reviews.submitReview));

router.delete('/:_idReview/user', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReviewUser))

router.delete('/:_idReview/admin', isLoggedIn,isAdmin, wrapAsync(reviews.deleteReviewAdmin))

router.delete('/:_idReview', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))

module.exports = router;