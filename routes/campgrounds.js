const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const { isLoggedIn, validateCampground, isCampgroundAuthor, wrapAsync } = require('../middleware')
const router = express.Router({ mergeParams: true });
const campgrounds = require('../controllers/campgrounds')


router.route('/')
    .get(wrapAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, upload.array('image'),
    //     wrapAsync(campgrounds.submitCampground))
    .post(isLoggedIn, upload.array('images'), validateCampground,
        wrapAsync(campgrounds.submitCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:_id')
    .get(wrapAsync(campgrounds.showCampground))
    // .put(isLoggedIn, isCampgroundAuthor, upload.array('images'),
    //     validateCampground, (req, res, next) => { console.log(req.body); next() }, wrapAsync(campgrounds.submitCampgroundChanges))
    .put(isLoggedIn, isCampgroundAuthor, upload.array('images'),
        validateCampground, wrapAsync(campgrounds.submitCampgroundChanges))
    .delete(isLoggedIn, isCampgroundAuthor,
        wrapAsync(campgrounds.deleteCampground));

router.get('/:_id/edit', isLoggedIn, wrapAsync(campgrounds.editCampground));


module.exports = router;