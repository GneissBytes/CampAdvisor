if (process.env.NODE_ENV !== "production") require('dotenv').config()

//#region requires
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')


const ExpressError = require('./utils/ExpressError')
const User = require('./models/user')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const usersRoutes = require('./routes/users')
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUlrs } = require('./sources')

const app = express();
//#endregion 

//#region app.use
app.use(mongoSanitize()); //sanitize queries
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "blob:", "data:", "https://res.cloudinary.com/dw87jombm/", "https://images.unsplash.com/"],
        fontSrc: ["'self'", ...fontSrcUlrs]
    }
}))
app.use(express.static(path.join(__dirname, 'public'))) // public directory
app.use(express.urlencoded({ exte: true })) // encoder for queries, params, bodies etc
app.use(methodOverride('_method')) // force methods
app.use(express.json()) // recognize incoming request objects as jsons

const sessionCongif = {
    name: 'session',
    secret: 'thisisnotasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //not accesible by javascript
        // secure: true, //cookies can be change only thru https
        expires: Date.now() + 7 * 3600 * 1000, //expire after a week 
        maxAge: 7 * 3600 * 1000
    }
}
app.use(session(sessionCongif))
app.use(flash())

app.use(passport.initialize()) //initialize passport, must be after use(session)
app.use(passport.session()) //persistent login session
passport.use(new LocalStrategy(User.authenticate())) //use LocalStratego, wtih auth method from User model

passport.serializeUser(User.serializeUser()) //serialize user using user
passport.deserializeUser(User.deserializeUser()) //same as above for deserializing

// send flash messages to all responds
app.use((req, res, next) => {
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        res.locals.currentUser = req.user;
        next();
    })
    //#endregion 

//#region app.set
app.set('view engine', 'ejs'); // use ejs as viewengine
app.set('views', path.join(__dirname, 'views')) // view directory
app.engine('ejs', ejsMate) // add layout, partial and block functions to ejs
    //#endregion

//#region mongoose connection
const dbUrl = process.env.MONGODB_URL
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console.log("error connecting to database")));
db.once("open", () => (console.log("connection to database established")));
//#endregion

//#region ROUTES
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:_idCamp/reviews', reviewsRoutes)
app.use('/', usersRoutes)
    //#endregion



app.get('/', (req, res) => {
    res.render('home', { title: "Welcome to YelpCamp" })
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    // console.log('error!!')
    // console.log(err)
    if (!err.message) err.message = "Something went wrong"
    if (process.env.NODE_ENV !== "production") {
        return res.status(statusCode).render('error', { title: err.name, err })
    }
    req.flash('error', `${err.message} Error code ${statusCode}`)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

app.listen(3000, () => {
    console.log('listening at 3000')
})