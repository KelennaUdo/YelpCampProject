const mongoose = require('mongoose');
const campgrounds = require('./campgrounds');
const reviews = require('./reviews')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    reviewRes:{
        type: String
    },
    Campgrounds: [
        {
            type: Schema.Types.ObjectId,
            ref: 'campground'
        }
    ],
    Reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'reviews'
        }
    ]
})



//This adds in a username and password field into the UserSchema using passport.
UserSchema.plugin(passportLocalMongoose);

UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
      // Delete all campgrounds created by the user
      await campgrounds.deleteMany({
        author: doc._id
      });
  
      // Delete all reviews left by the user
      await reviews.deleteMany({
        author: doc._id
      });
    }
  });

module.exports = new mongoose.model('User', UserSchema);

