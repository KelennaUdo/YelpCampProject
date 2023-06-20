const wrapAsync = require('./Utilities/catchAsync');

//for review deletion authourization.
const Review = require('./models/reviews');
// For "isAuthour" middelware.
const Campgrounds = require('./models/campgrounds');
//for valdateCampground and validateReview
const {campgroundSchema, reviewsSchema}= require('./validateschema');
// for both valdateCampground & validateReview
const ExpressError = require('./Utilities/ExressError');

//cleans out "/logout" from a route if that was the last route a user tried to use while notloged in.
const removeRoute = (route)=>{
    const routeArray = route.split('/');
    const newArray = routeArray.filter(each => each !=='logout');
    return newArray.join('/');
} 

// to check if a user is logged in
module.exports.isLoggedIn  = function(req, res, next){
    if(!req.isAuthenticated()){
        //the was to fix a bug that would automatically logout a user if req.originalUrl were the logout route which is a get request 
        req.originalUrl.includes('/logout')?req.session.returnTo = removeRoute(req.originalUrl): req.session.returnTo = req.originalUrl; 
        req.flash('error' , `You must be logged in First`);
        if(req.params.id){
            const redirect = `/campgrounds/${req.params.id}`;
            return res.redirect(redirect);
        }      
        return res.redirect( '/campgrounds');
      }
      next();
}

// stores route to return to if a user made a request the they weren't authorized to whie logged out.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


// middleware validation function 
// for put and post requests 
module.exports.validateCampground =(req, res, next) =>{
    const result = campgroundSchema.validate(req.body)
        if(result.error){
            throw new ExpressError(result.error.message, 400)
        }else{
            next()
        }
}
//to check if a person isauthorized to make a request such as editing or deleting 
module.exports.isAuthor = wrapAsync( async (req, res, next)=>{
  const {id} = req.params;
  const campground = await Campgrounds.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash('error', "You're not authrized to edit this");
    return res.redirect(`/campgrounds/${id}`)
   }
   next();
})

//validation middleware function.
module.exports.validateReview = (req, res, next)=>{
    const result = reviewsSchema.validate(req.body.review);
    if(result.error){
        throw new ExpressError(result.error.message, 400)
    }else{
        next()
    }
}

//review deletion authorization
module.exports.isReviewAuthor = wrapAsync(async (req, res, next)=>{
    const {reviewId, id} = req.params;
    const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)){
    req.flash('error', "You're not authrized to delete this review");
    return res.redirect(`/campgrounds/${id}`);
   }
   next();
});
  
 
  