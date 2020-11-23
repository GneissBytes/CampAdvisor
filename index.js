const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const wrapAsync = require('./utils/wrapAsync')
const Joi = require('joi')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')


const app = express();
app.set('view engine', 'ejs'); // use ejs
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ exte: true })) // REEEEEEEEEEEE
app.use(methodOverride('_method')) // forcing methods
app.use(express.json())



mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console.log("error connecting to database")));
db.once("open", () => (console.log("connection to database established")));


app.get('/', (req, res) => {
    res.send('its working')
})



app.get('/campgrounds', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    if (!campgrounds) throw new ExpressError('No camps found', 503)
    res.render('campgrounds/index', { campgrounds, title: "All campgrounds" })
}));

app.post('/campgrounds', wrapAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    });
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const message = error.details.map(str => str.message).join(',')
        throw new ExpressError(message, 400)
    }
    const { campground } = req.body;
    console.log(campground)
    const newCampground = new Campground({ ...campground });
    await newCampground.save()
    res.redirect('/campgrounds')
}));

app.get('/campgrounds/new', wrapAsync(async (req, res) => {
    res.render('campgrounds/new', { title: "New Campground" })
}));


app.get('/campgrounds/:_id', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/show', { campground, title: campground.title })
}));

app.get('/campgrounds/:_id/edit', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    res.render('campgrounds/edit', { campground, title: `Editing ${campground.title}` })
}));

app.put('/campgrounds/:_id/', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const newData = req.body.newDetails;
    const editedCampground = await Campground.findOneAndUpdate({ _id },
        { $set: { ...newData } },
        { new: true, runValidators: true })
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    console.log(editedCampground)
    res.redirect(`/campgrounds/${_id}`)
}));

app.delete('/campgrounds/:_id/', wrapAsync(async (req, res) => {
    const { _id } = req.params;
    const removedCampground = await Campground.findOneAndRemove({ _id })
    if (campground == undefined) throw new ExpressError("No campground with this id found.", 404)
    console.log(removedCampground)
    res.redirect('/campgrounds')
}));


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong"

    res.status(statusCode).render('error', { title: err.name, err })
})

app.listen(3000, () => {
    console.log('listening at 3000')
})