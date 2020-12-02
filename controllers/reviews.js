const Review = require('../models/review')
const Campground = require('../models/campground')
const User = require('../models/user')

module.exports.submitReview = async (req, res) => {
    const { _idCamp } = req.params
    const campground = await Campground.findById(_idCamp)
    const review = new Review(req.body.review)
    const user = await User.findOne({ username: req.user.username })
    campground.reviews.push(review);
    review.author = user;
    user.reviews.push(review)
    await review.save()
    await campground.save()
    await user.save()
    req.flash('success', 'Review added successfully!')
    res.redirect(`/campgrounds/${_idCamp}`)
}

module.exports.deleteReview = async (req, res) => {
    const { _idCamp, _idReview } = req.params;
    const campground = await Campground.findByIdAndUpdate(_idCamp, { $pull: { reviews: _idReview } }, { useFindAndModify: false })
    const review = await Review.findOneAndDelete({ _id: _idReview }, { useFindAndModify: false })
    req.flash('success', 'Review deleted successfully!')
    res.redirect(`/campgrounds/${_idCamp}`)
}

module.exports.campgroundRedirect = (req, res) => {
    const { _idCamp } = req.params
    res.redirect(`/campgrounds/${_idCamp}`)
}