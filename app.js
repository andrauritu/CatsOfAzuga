if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const dbUrl = /*process.env.DB_URL ||*/ 'mongodb://127.0.0.1:27017/catDB'
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const { catSchema, reviewSchema } = require('./schemas.js');

// const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');

const Cat = require('./models/cat');
// const Review = require('./models/review');

const catRoutes = require('./routes/cats');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// 'mongodb://127.0.0.1:27017/catDB'

mongoose.connect(dbUrl)
    .then(() => {
        console.log('mongo connection open')
    })
    .catch(err => {
        console.log('mongo conn Error')
        console.log(err)
    })



const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //this is a middleware that parses the body of the request
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_' //this will replace any $ or . with an underscore to prevent mongo injection
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, //this is in seconds
    crypto: {
        secret: secret
    }
});

const sessionConfig = {
    name: 'session',
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //this is for security reasons
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //this is for the cookie to expire in a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = []; //we are not using any fonts
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlx9ufwpz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session()); //this is for persistent login sessions
passport.use(new LocalStrategy(User.authenticate())); //this is for the local strategy that we are using
passport.serializeUser(User.serializeUser()); //this is for serializing the user
passport.deserializeUser(User.deserializeUser()); //this is for deserializing the user

app.use((req, res, next) => { //this is a middleware that will allow us to access the flash messages in the templates
    res.locals.currentUser = req.user; //this is for the current user to be available in all templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.moment = require('moment');
    next();
})

app.use('/', userRoutes)
app.use('/cats', catRoutes);
app.use('/cats/:id/reviews', reviewRoutes);


app.get('/', async (req, res) => {
    const cats = await Cat.find({});
    res.render('home', { cats })
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no smth went wrong!'
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});