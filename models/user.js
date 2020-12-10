const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const Campground = require('./campground')
const passportLocalMongoose = require('passport-local-mongoose');
const { campgroundSchema } = require('../schemas');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    campgrounds: [{
        type: Schema.Types.ObjectId,
        ref: 'Campgrounds'
    }],
    isAdmin: { type: Boolean, default: false },
    canAddCampground: { type: Boolean, default: false },
    canAddReview: { type: Boolean, default: false }
})

userSchema.plugin(passportLocalMongoose) // adds username, password, makes them unique and required, adds additional methods

userSchema.post('findOneAndDelete', async function(user, next) {
    if (user) {
        let reviews = user.reviews;
        let campgrounds = user.campgrounds
        await Review.deleteMany({_id: {$in: reviews}})
        await Campground.deleteMany({_id: {$in: campgrounds}})
    }
})


module.exports = mongoose.model('User', userSchema)