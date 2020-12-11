const router = require('express').Router();
const { wrapAsync, grabPrevious, isLoggedIn, isAuthorizedUser, isAdmin, } = require('../middleware')
const users = require('../controllers/users')
const User = require('../models/user')

router.route('/login')
    .get(users.getLoginForm)
    .post(users.verifyUser, wrapAsync(users.login));

router.route('/register')
    .get(users.getRegisterForm)
    .post(wrapAsync(users.submitUser));

router.route('/users/:_id')
    // .get(async (req, res) => {
    //     const {_id} = req.params;
    //     res.send(await User.findById(_id))
    // })
    .get(isLoggedIn, wrapAsync(isAuthorizedUser), wrapAsync(users.viewUser))
    .put(isLoggedIn, wrapAsync(isAuthorizedUser), wrapAsync(users.changeUser), wrapAsync(users.logout))
    .delete(isLoggedIn, wrapAsync(isAuthorizedUser), wrapAsync(users.deleteUser), wrapAsync(users.logout))

router.route('/users/:_id/edit')
    .get(isLoggedIn, isAuthorizedUser, wrapAsync(users.getEditUser))


router.route('/admin')
    .get(isLoggedIn, wrapAsync(isAdmin), wrapAsync(users.adminPanel))

router.route('/admin/edit-privleges/:_id')
    .get(isLoggedIn, wrapAsync(isAdmin), wrapAsync(users.getPrivlegeEditForm))
    .put(isLoggedIn, wrapAsync(isAdmin), wrapAsync(users.submitPrivlegeChanges))
router.get('/logout', users.logout)


module.exports = router