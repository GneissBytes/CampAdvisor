const User = require('../models/user')
const router = require('express').Router();
const wrapAsync = require('../utils/wrapAsync')
const passport = require('passport')


router.get('/register', (req, res) => {
    res.render('users/register', { title: 'User registration' })
})

router.post('/register', wrapAsync(async (req, res, next) => {
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
        console.dir(e)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login', { title: "Log in" })
})

router.post('/login',
    passport.authenticate('local', {
        failureFlash: true, failureRedirect: '/login'
    }), wrapAsync(async (req, res) => {
        req.flash('success', `Welcome back!`)
        const redirectUrl = req.session.returnTo || '/campgrounds'
        delete req.session.returnTo
        res.redirect(redirectUrl)
    }))

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'Logged out')
    res.redirect('/campgrounds')
})

module.exports = router