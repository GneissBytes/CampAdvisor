const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();
var methodOverride = require('method-override')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const accessToken = 'pk.eyJ1IjoiY3RodWxodXRoZSIsImEiOiJja2ljMDFpMzgxNG10MzF0ZzJvbTE2aXE2In0.UnQKfpdgtpFAgiyldrsjQw'
const geocoder = mbxGeocoding({ accessToken })


app.set('view engine', 'ejs'); // use ejs
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ exte: true })) // REEEEEEEEEEEE
app.use(methodOverride('_method')) // forcing methods
app.use(express.json())


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console.log("error connecting to database")));
db.once("open", () => (console.log("connection to database established")));

Array.prototype.randomElement = function () {
    const index = Math.floor(Math.random() * this.length)
    return this[index]
}

const randomPrice = function (max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) * 100) / 100
}

const seedDB = async function () {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const location = cities.randomElement()
        const newCampground = new Campground({
            title: `${descriptors.randomElement()} ${places.randomElement()}`,
            location: `${location.city}, ${location.state}`,
            price: randomPrice(500),
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusamus illum aspernatur doloribus explicabo incidunt omnis ducimus sunt, magni labore consequuntur.',
            images: [{
                url: 'https://res.cloudinary.com/dw87jombm/image/upload/v1607183487/YelpCamp/19fbbd4b29faabde35be5146e4be7c2a4d110ced9edb4c65428d9073dee511e4_naynx2.jpg',
                filename: 'yelpcamp/19fbbd4b29faabde35be5146e4be7c2a4d110ced9edb4c65428d9073dee511e4_naynx2'
            }],
            author: '5fd0df580c74043d6023edec'
        })
        const geodata = await geocoder.forwardGeocode({
            query: newCampground.location,
            limit: 1
        }).send()
        newCampground.geometry = geodata.body.features[0].geometry;
        await newCampground.save()
        console.log('saved camp', i)
    }
    console.log('Finished saving')
}

seedDB()
    .then(() => db.close())