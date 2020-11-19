const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();
var methodOverride = require('method-override')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
const { random } = require('colors');

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
    for (let i = 0; i < 100; i++) {
        const location = cities.randomElement()
        const newCampground = new Campground({
            title: `${descriptors.randomElement()} ${places.randomElement()}`,
            location: `${location.city}, ${location.state}`,
            price: randomPrice(500),
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusamus illum aspernatur doloribus explicabo incidunt omnis ducimus sunt, magni labore consequuntur.',
            image: 'http://source.unsplash.com/collection/483251'
        })
        await newCampground.save()
        console.log('saved camp', i)
    }
    console.log('Finished saving')
}

seedDB()
    .then(() => db.close())