const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })
const Campground = require('../models/campground')
const countSufix = require('../utils/countSufixer')


const { isLoggedIn, validateCampground, isCampgroundAuthor, wrapAsync, canAddCampground} = require('../middleware')
const router = express.Router({ mergeParams: true });
const campgrounds = require('../controllers/campgrounds')


router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, wrapAsync(canAddCampground), upload.array('images'), validateCampground,
        wrapAsync(campgrounds.submitCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:_id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampgroundAuthor, upload.array('images'),
        validateCampground, wrapAsync(campgrounds.submitCampgroundChanges))
    .delete(isLoggedIn, isCampgroundAuthor,
        wrapAsync(campgrounds.deleteCampground));

router.get('/:_id/edit', isLoggedIn, wrapAsync(campgrounds.editCampground));


module.exports = router;