const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./user')
const Campground = require('./campground')
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground',
        required: true
    }
})


reviewSchema.post('findOneAndDelete', async function (review, next) {
    if (review) {
        await mongoose.model('User').findByIdAndUpdate(review.author, { $pull: { reviews: review._id } }, { useFindAndModify: false });

        //THIS WORKS
        await mongoose.model('Campground').findByIdAndUpdate(review.campground, { $pull: { reviews: review._id } }, { useFindAndModify: false })
        //THIS DOESNT
        // Campground.findByIdAndUpdate(review.campground, { $pull: { reviews: review._id } }, { useFindAndModify: false })
        //BUT IT WORKS WITH USER MODEL????????? 
        //KURWA CZEMU
    }
    next()
})

module.exports = mongoose.model("Review", reviewSchema)