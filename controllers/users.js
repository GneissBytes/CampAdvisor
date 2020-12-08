const passport = require('passport')
const User = require('../models/user')


module.exports.getRegisterForm = (req, res) => {
    res.render('users/register', { title: 'User registration' })
}

module.exports.submitUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body.user
        const registeredUser = await User.register(new User({ email, username }), password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')
        })

    } catch (e) {
        if (e.keyPattern) e.message = 'A user with the given email is already registered'
        req.flash('error', e.message)
        res.redirect('/register')
    };
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