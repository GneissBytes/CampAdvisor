const router = require('express').Router();
const { wrapAsync, grabPrevious } = require('../middleware')
const users = require('../controllers/users')

router.route('/login')
    .get(users.getLoginForm)
    .post(users.verifyUser, wrapAsync(users.login));

router.route('/register')
    .get(users.getRegisterForm)
    .post(wrapAsync(users.submitUser))

router.get('/logout', users.logout)

module.exports = router