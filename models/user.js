const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

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
    isAdmin: { type: Boolean, default: false },
    canAddCampground: { type: Boolean, default: false },
    canAddReview: { type: Boolean, default: false }
})

userSchema.plugin(passportLocalMongoose) // adds username, password, makes them unique and required, adds additional methods

module.exports = mongoose.model('User', userSchema)