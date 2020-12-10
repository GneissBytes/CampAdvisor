const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })
const Campground = require('../models/campground')
const countSufix = require('../utils/countSufixer')


const { isLoggedIn, validateCampground, isCampgroundAuthor, wrapAsync, canAddCampground, isAdmin } = require('../middleware')
const router = express.Router({ mergeParams: true });
const campgrounds = require('../controllers/campgrounds')


router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, wrapAsync(canAddCampground), upload.array('images'), validateCampground,
        wrapAsync(campgrounds.submitCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.delete('/:_id/user', isLoggedIn, isCampgroundAuthor,
    wrapAsync(campgrounds.deleteCampgroundUser));


router.delete('/:_id/admin', isLoggedIn, isAdmin,
    wrapAsync(campgrounds.deleteCampgroundAdmin));



router.route('/:_id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampgroundAuthor, upload.array('images'),
        validateCampground, wrapAsync(campgrounds.submitCampgroundChanges))
    .delete(isLoggedIn, isCampgroundAuthor,
        wrapAsync(campgrounds.deleteCampground));

router.get('/:_id/edit', isLoggedIn,isCampgroundAuthor, wrapAsync(campgrounds.editCampground));


module.exports = router;