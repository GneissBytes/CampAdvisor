const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const User = require('./user')


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } }

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    images: [ImageSchema],
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        }, coordinates: {
            type: [Number],
            required: true
        }
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
}, opts)



campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p class="mt-0 mb-0">${this.location}</p>
    <p class="mb-0">$${this.price}/day</p>`
})

campgroundSchema.virtual('toMapBox').get(function() {
    return {title: this.title, location:this.location, price: this.price, geometry:this.geometry, properties: {popUpMarkup: this.properties.popUpMarkup}}
})

campgroundSchema.post('findOneAndRemove', async function (campground, next) {
    if (campground) {
        let reviews = campground.reviews;
        await mongoose.model('Review').deleteMany({ _id: { $in: reviews } });
        await mongoose.model('User').findByIdAndUpdate(campground.author, { $pull: { campgrounds: campground._id } }, { useFindAndModify: false });
    }
    next()

})

module.exports = mongoose.model('Campground', campgroundSchema)