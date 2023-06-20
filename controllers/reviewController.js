const Review = require('../models/reviews');
const Campgrounds = require('../models/campgrounds');
const user = require('../models/user');


module.exports.createReview = async (req, res)=>{
    const campground = await Campgrounds.findById(req.params.id).populate('author').populate('review');
    const currentUser =  await user.findById(req.user._id);
    const newreview =  new Review(req.body.review);
    await  campground.review.push(newreview);
    currentUser.Reviews.push(newreview);
    newreview.author = req.user._id;
    await newreview.save();        
    await campground.save();  
    await currentUser.save();
    const flashMessage = campground.author.reviewRes !== ""? `"${campground.author.reviewRes}".` : '"Thanks for leaving a review".'
    req.flash('success', `${campground.author.username} says ${flashMessage}`);
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req, res)=>{
    const {id,reviewId} = req.params;
    //deletes form the campground document
    await Campgrounds.findByIdAndUpdate(id, {$pull: {review: reviewId}});
    //deletes form the reviews collection
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted your review')
    res.redirect(`/campgrounds/${id}`);
}