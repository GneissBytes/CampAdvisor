const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/campground')
const Review = require('./models/review');
const User = require('./models/user')


const wrapAsync = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(error => next(error));
    };
};

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (user.isAdmin) {
        next();
    } else {
        throw new ExpressError("You must be an admin to view this", 403)
    }
}

const canAddReview = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (user.isAdmin || user.canAddReview) {
        next()
    } else {
        throw new ExpressError("You dont have review privleges", 403)
    }
}

const canAddCampground = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (user.isAdmin || user.canAddCampground) {
        next()
    } else {
        throw new ExpressError("You dont have enough privleges to add a new campground", 403)
    }
}

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
    const { error } = reviewSchema.validate(req.body)
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

const isCampgroundAuthor = async (req, res, next) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id);
    if (campground.author.equals(req.user._id) || res.locals.currentUser.isAdmin) {
        next ()
    } else {
        req.flash('error', 'You are not authorized to edit this campground');
        return res.redirect(`/campgrounds/${_idCamp}`); 
    }
}

const isReviewAuthor = async (req, res, next) => {
    const { _idCamp, _idReview } = req.params;
    const review = await Review.findById(_idReview)
    console.log(res.locals.currentUser.isAdmin)
    console.log(!review.author.equals(req.user._id) || !res.locals.currentUser.isAdmin)
    if (review.author.equals(req.user._id) || res.locals.currentUser.isAdmin) {
        next ()
    } else {
        req.flash('error', 'You are not authorized to edit this review');
        return res.redirect(`/campgrounds/${_idCamp}`);
    }
}

const grabPrevious = (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    next()
}


module.exports = {
    isLoggedIn,
    validateCampground,
    validateReview,
    isCampgroundAuthor,
    wrapAsync,
    isReviewAuthor,
    grabPrevious,
    isAdmin,
    canAddReview,
    canAddCampground
}