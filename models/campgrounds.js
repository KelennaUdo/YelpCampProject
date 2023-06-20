const mongoose = require('mongoose');
const reviews = require('./reviews');
const Schema = mongoose.Schema;
// so that when documents are converted to json, they contin the virtual properties.
// it is called in the Schema
const opts = { toJSON: { virtuals: true } }
const imageSchema = new Schema( {
    url: String,
    filename: String
})
//for index page - sets up a virtual property which midifies the images's dimentions
imageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload', '/upload/w_200');
});
// for show page - sets up a virtual property which midifies the images's dimentions
imageSchema.virtual('show').get(function(){
    return this.url.replace('/upload', '/upload/w_544,h_306');
 });

const CampgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: Number,
    description: String,
    location: String,
    author: {
        type:Schema.Types.ObjectId,
        ref: 'User'
    },
    review: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]

}, opts);

CampgroundSchema.virtual('properties.popMarkup').get(function(){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,100)}...</p>
    `
 });

// this middleware function(model middleware function) is designed to clean up associated reviews when a campground document is deleted. 
// It ensures that all reviews linked to the deleted campground are also removed from the reviews collection.
CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await reviews.deleteMany({
            // This condition matches documents in the reviews collection where the _id field is present in the doc.review array.
            //  It essentially deletes all reviews associated with the deleted campground.
            _id :{
                $in: doc.review
            }
        })
    }   
})

module.exports = mongoose.model('campground', CampgroundSchema)

