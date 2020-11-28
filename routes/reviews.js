const express = require('express');
const wrapAsync = require('../utils/wrapAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { validateReview } = require('../utils/validation')
const router = express.Router({ mergeParams: true });


router.post('/', validateReview, wrapAsync(async (req, res) => {
    const { _idCamp } = req.params
    const campground = await Campground.findById(_idCamp)
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${_idCamp}`)
}))

router.delete('/:_idReview', wrapAsync(async (req, res) => {
    const { _idCamp, _idReview } = req.params;
    console.log(req.params)
    const campground = await Campground.findByIdAndUpdate(_idCamp, { $pull: { reviews: _idReview } })
    const review = await Review.findOneAndDelete({ _id: _idReview }, { useFindAndModify: false })
    res.redirect(`/campgrounds/${_idCamp}`)
}))

module.exports = router;