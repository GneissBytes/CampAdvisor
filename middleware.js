const ExpressError = require("./utils/ExpressError");
const {campgroundSchema, reviewSchema} = require('./schemas')
const Campground = require('./models/campground')

// check if campground data is correct
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}





const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to access this page!')
        return res.redirect('/login')
    }
    next()
}

const isAuthor = async (req, res, next) => {
    const {_id} = req.params;
    const campground = await Campground.findById(_id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to edit this page')
        return res.redirect(`/campgrounds/${_id}`)
    }
    next()
}

module.exports = { isLoggedIn, validateCampground, validateReview, isAuthor}