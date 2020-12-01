const express = require('express');
const wrapAsync = require('../utils/wrapAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')
const User = require('../models/user')
const {isLoggedIn, validateReview} = require('../middleware')
const router = express.Router({ mergeParams: true });


router.post('/',isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const { _idCamp } = req.params
    const campground = await Campground.findById(_idCamp)
    const review = new Review(req.body.review)
    const user = await User.findOne({username: req.user.username})
    campground.reviews.push(review);
    review.author = user;
    user.reviews.push(review)
    await review.save()
    await campground.save()
    await user.save()
    req.flash('success', 'Review added successfully!')
    res.redirect(`/campgrounds/${_idCamp}`)
}))

router.get('/', (req, res)=>{
    const { _idCamp } = req.params
    res.redirect(`/campgrounds/${_idCamp}`)
})

router.delete('/:_idReview',isLoggedIn, wrapAsync(async (req, res) => {
    const { _idCamp, _idReview } = req.params;
    console.log(req.params)
    const campground = await Campground.findByIdAndUpdate(_idCamp, { $pull: { reviews: _idReview } })
    const review = await Review.findOneAndDelete({ _id: _idReview }, { useFindAndModify: false })
    req.flash('success', 'Review deleted successfully!')
    res.redirect(`/campgrounds/${_idCamp}`)
}))

module.exports = router;