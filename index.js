const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const app = express();

//#region Settings
app.set('view engine', 'ejs'); // use ejs as viewengine
app.set('views', path.join(__dirname, 'views')) // view directory
app.engine('ejs', ejsMate) // add layout, partial and block functions to ejs
app.use(express.static(path.join(__dirname, 'public'))) // public directory
app.use(express.urlencoded({ exte: true })) // encoder for queries, params, bodies etc
app.use(methodOverride('_method')) // force methods
app.use(express.json()) // recognize incoming request objects as jsons
//#endregion

//#region mongoose connection
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console.log("error connecting to database")));
db.once("open", () => (console.log("connection to database established")));
//#endregion

app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:_idCamp/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.send('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    console.log('error!!')
    console.log(err)
    if (!err.message) err.message = "Something went wrong"
    res.status(statusCode).render('error', { title: err.name, err })
})

app.listen(3000, () => {
    console.log('listening at 3000')
})