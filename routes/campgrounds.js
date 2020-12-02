const express = require('express');
const { isLoggedIn, validateCampground, isCampgroundAuthor, wrapAsync } = require('../middleware')
const router = express.Router({ mergeParams: true });
const campgrounds = require('../controllers/campgrounds')

router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, wrapAsync(campgrounds.submitCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:_id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampgroundAuthor,
         validateCampground, wrapAsync(campgrounds.submitCampgroundChanges))
    .delete(isLoggedIn, isCampgroundAuthor, wrapAsync(campgrounds.deleteCampground));

router.get('/:_id/edit', isLoggedIn, wrapAsync(campgrounds.editCampground));


module.exports = router;