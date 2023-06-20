const express = require('express');
//express router so that router event listeners aren't written in index.js
const router = express.Router({mergeParams: true});
const wrapAsync = require('../Utilities/catchAsync');
//middlware functions for authourization and authentication
const {validateReview, isLoggedIn, isReviewAuthor} = require('../Middleware')
const reviewController = require('../controllers/reviewController')


//Creates a new review under a specific camp
router.post('/', isLoggedIn,validateReview, wrapAsync(reviewController.createReview))
//deletes a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview))

module.exports = router