const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CamgroundSchema = new Schema({
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
    }
})

module.exports = mongoose.model('Campground', CamgroundSchema)