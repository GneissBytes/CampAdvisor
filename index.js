const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const app = express();

const Campground = require('./models/campground')

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
});

const db = mongoose.connection;
db.on("error", console.error.bind(console.log("error connecting to database")));
db.once("open", () => (console.log("connection to database established")));


app.get('/', (req, res) => {
    res.send('its working')
})



app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    console.log(`loaded ${campgrounds.length} camps`)
    res.render('campgrounds/index', { campgrounds, title:"All campgrounds" })
});

app.post('/campgrounds', async (req, res) => {
    const { campground } = req.body;
    const newCampground = new Campground({ ...campground });
    await newCampground.save()
    res.redirect('/campgrounds')
})

app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new', {title:"New Campground"})
})


app.get('/campgrounds/:_id', async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    res.render('campgrounds/show', { campground, title:campground.title })
});

app.get('/campgrounds/:_id/edit', async (req, res) => {
    const { _id } = req.params;
    const campground = await Campground.findById(_id)
    res.render('campgrounds/edit', { campground, title:`Editing ${campground.title}` })
});

app.put('/campgrounds/:_id/', async (req, res) => {
    const { _id } = req.params;
    const newData = req.body.newDetails;
    const editedCampground = await Campground.findOneAndUpdate({ _id },
        { $set: { ...newData } },
        { new: true })
    console.log(editedCampground)
    res.redirect(`/campgrounds/${_id}`)
});

app.delete('/campgrounds/:_id/', async (req, res) => {
    const {_id} = req.params;
    const removedCampground = await Campground.findOneAndRemove({_id})
    console.log(removedCampground)
    res.redirect('/campgrounds')
});






app.listen(3000, () => {
    console.log('listening at 3000')
})