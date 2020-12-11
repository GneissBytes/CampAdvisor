const passport = require('passport')
const User = require('../models/user')
const Campgrounds = require('../models/campground')
const Review = require('../models/review')
const ExpressError = require('../utils/ExpressError')

module.exports.getRegisterForm = (req, res) => {
    res.render('users/register', { title: 'User registration' })
}

module.exports.submitUser = async (req, res, next) => {
    const { email, username, password } = req.body.user
    const registeredUser = await User.register(new User({ email, username }), password)
    req.login(registeredUser, err => {
        if (err) return next(err)
        req.flash('success', 'Welcome to Yelp Camp')
        res.redirect('/campgrounds')
    })
};

module.exports.getLoginForm = (req, res) => {
    res.render('users/login', { title: "Log in" })
};

module.exports.login = async (req, res) => {
    req.flash('success', `Welcome back!`)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
};

module.exports.verifyUser = passport.authenticate('local', {
    failureFlash: true, failureRedirect: '/login'
});

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('success', 'Logged out')
    res.redirect('/campgrounds')
};


module.exports.viewUser = async (req, res) => {
    const user = await User.findById(req.params._id);
    const campgrounds = await Campgrounds.find({ author: user._id });
    const reviews = await Review.find({ author: user._id }).populate('campground', 'title')
    res.render('users/user-panel', { user, campgrounds, reviews, title: user.username });
}

module.exports.adminPanel = async (req, res) => {
    const users = await User.find();
    const campgrounds = await Campgrounds.find().populate('author', 'username');
    const reviews = await Review.find().populate('author', 'username')
    res.render('users/admin-panel', { users, campgrounds, reviews, title: 'Admin panel' })
}

module.exports.submitUserChanges = async (req, res) => {
    res.send('deleting you senpai')
}

module.exports.deleteUser = async (req, res, next) => {
    const { _id } = req.params;
    const user = await User.findOneAndDelete({ _id }, { useFindAndModify: false })
    req.flash('success', 'Account deleted successfully!')
    if (res.locals.currentUser.isAdmin) {
        return res.redirect('/admin')
    } else {
        next()
    }

}

module.exports.changeUser = async (req, res) => {
    const { _id } = req.params;
    const { username, email, new_password, old_password } = req.body;
    try {
        const user = await User.findByIdAndUpdate(_id, { $set: { username, email } }, { useFindAndModify: false, runValidators: true })
        if (new_password && old_password) {
            await user.changePassword(old_password, new_password)
        }
    } catch(err) {
        return new ExpressError(err.message, 403)
    }
    }


res.redirect(`/login`)

}

module.exports.getEditUser = async (req, res) => {
    const { _id } = req.params
    const user = await User.findById(_id)
    res.render('users/edit', { user, title: 'Account edit' })
}

module.exports.getPrivlegeEditForm = async (req, res) => {
    const { _id } = req.params;
    const user = await User.findById(_id)
    res.render('users/edit-privleges', { user, title: 'Editing privleges' })
}

module.exports.submitPrivlegeChanges = async (req, res) => {
    const { _id } = req.params;
    console.log(req.body)
    const { isAdmin, canAddReview, canAddCampground } = req.body;
    const user = await User.findByIdAndUpdate(_id, {
        $set: {
            isAdmin: isAdmin === 'true' ? true : false,
            canAddReview: canAddReview === 'true' ? true : false,
            canAddCampground: canAddCampground === 'true' ? true : false
        }
    }, { findUseAndModify: false });
    res.redirect("/admin")
}

