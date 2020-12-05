const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})
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
    images: [ImageSchema],
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