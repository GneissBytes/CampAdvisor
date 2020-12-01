const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const campgroundSchema = new Schema({
    title: {
        type: String,
    },
    price: {
        type: Number,
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    location: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }]
})

campgroundSchema.post('findOneAndRemove', async function (campground, next) {
    if (campground) {
        let reviews = campground.reviews;
        await Review.deleteMany({ _id: { $in: reviews } });
    }
    next()

})

module.exports = mongoose.model('Campground', campgroundSchema)