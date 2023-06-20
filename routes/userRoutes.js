const express = require('express');
//express router so that router event listeners aren't written in index.js
const router  = express.Router();
//this not used here but in the UserController
const wrapAsync = require('../Utilities/catchAsync');
const passport = require('passport');
//middlware functions for authourization and authentication
const {isLoggedIn, storeReturnTo} = require('../Middleware');
const UsersController = require('../controllers/userController')

//fancy way to restructure routes
router.route('/register')
//route to display registration form
.get(UsersController.registerForm)
//Route to create a new user (register)
.post(wrapAsync(UsersController.register));

router.route('/login')
//login form route  
.get(UsersController.loginForm)
//Login Authourization route
.post(
  // use the storeReturnTo middleware to save the returnTo value from session to res.locals
  storeReturnTo,
   // passport.authenticate logs the user in and clears req.session
  passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}),
  // Now we can use res.locals.returnTo to redirect the user after login  
  wrapAsync(UsersController.login) 
   )

//route to show current user profile
router.get('/profile/:userId', wrapAsync(UsersController.getUserProfile))

//to render a form for updating a user profile

router.get('/editprofile/:userId', isLoggedIn,  wrapAsync(UsersController.getEditUserProfile))

//to update a user profile

router.route('/editprofile')
.delete(isLoggedIn, wrapAsync(UsersController.deleteUserProfile))
.put(isLoggedIn, wrapAsync(UsersController.editUserProfile))

// logout route
router.get('/logout', isLoggedIn, wrapAsync(UsersController.logout));

module.exports = router;

