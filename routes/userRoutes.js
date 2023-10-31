const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// SignUp Route
router.route('/signup').post(authController.signup);

// LOGIN ROUTE
router.route('/login').post(authController.login);
router.get('/logout', authController.logout);

// FORGOT PASSWORD AND RESET PASSWORD ROUTES
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect Remaining Routes from unauthorized users
router.use(authController.protect);

// UPDATE PASSWORD FOR CURRENTLY LOGGED IN USERS
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

// /me endpoint
router.get('/me', userController.getMe, userController.getUser);

// UPDATE USER DATA FOR CURRENTLY LOGGED IN USERS
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

// DELETE USER ACCOUNT FOR CURRENTLY LOGGED IN USERS
router.delete('/deleteMe', userController.deleteMe);

// Restrict routes to admin only
router.use(authController.restrictTo('admin'));

// REGULAR ROUTES
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  )
  .delete(userController.deleteUser);

module.exports = router;
