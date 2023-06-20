const express = require('express');
const path = require('path');
const mongoose = require('mongoose');  
mongoose.set('strictQuery', true);
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const campgroundRoutes = require('./routes/campRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const session = require('express-session'); 
const flash = require('connect-flash');
const passport = require('passport');
//the passport-local strategy is used for user name and password authentication.
const LocalStrategy = require('passport-local');
const User = require('./models/user'); 
const userRoutes  = require('./routes/userRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
//MongoDB session store. enables session data to be stored in mongoDB.
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp' ;
mongoose.connect(dbUrl, { useNewUrlParser: true , useUnifiedTopology: true });
const db = mongoose.connection;
 db.on('error', console.error.bind(console, "connection error:"));
 db.once('open', ()=>{
    console.log('connection to database: open')
 })
const app = express();

app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );
// configuring store for session data.
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
  const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log('session store error', e)
})
// configuring session options
const sessionConfig = {
    name: 'session',
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

//these two methods are gotten form passport-local-mongoose in the User model
// serialize and deserialize stores or 'unstores' user sessions. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    helmet()
  );


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
    "https://cdn.jsdelivr.net",
    "https://images.unsplash.com"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",

];
const fontSrcUrls = [];
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
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.get('/', (req, res)=>{
    res.render('home')
})
 


//default error handler 
app.use((err, req, res, next)=>{
    const {status = 500} = err;
    console.log(err.message)
    if(!err.message) err.message = 'Oh no something went wrong';
    res.status(status).render('error', {err})
    // req.flash('error', err.message);
    // res.redirect('/campgrounds');
})



app.listen(3000, ()=>{
    console.log('Listening on port 3000' );
})

