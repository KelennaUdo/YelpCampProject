//access token for mapbox
if(process.env.NODE_ENV !== 'production'){
require('dotenv').config()
}
const express = require('express');
//express router so that router event listeners aren't written in index.js
const passport = require('passport');
const router = express.Router();
const wrapAsync = require('../Utilities/catchAsync');
const campgroundsController = require('../controllers/campController');
//middlware functions for authourization and authentication
const {isLoggedIn, validateCampground, isAuthor} = require('../Middleware');
const {storage} = require('../cloudinary');// node automatically looks for filenames of index so no need to add that to the route
const multer = require('multer');
const upload = multer({ storage});

router.route('/')
//camp grounds index
.get(wrapAsync(campgroundsController.index))
//creates a new campground 
.post(isLoggedIn,upload.array('images'), validateCampground , wrapAsync(campgroundsController.createNew))


//renders form to create a new camp ground
router.get('/new', isLoggedIn, campgroundsController.newForm);

router.route('/:id')
  //route to edit a campground
.put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, wrapAsync(campgroundsController.edit))
//show route for each campground
.get(wrapAsync(campgroundsController.show))
  
//to delete a campground
.delete(isLoggedIn, isAuthor, wrapAsync(campgroundsController.delete))



//renders a form to edit an existing campground
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgroundsController.editForm));




 module.exports = router