const express = require("express")
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const multer = require('multer')
const mkdirp = require('mkdirp')
const userRouter = require("./routes/user")
const indexRouter = require('./routes/index')
const fileRouter = require('./routes/file')
const repositoryRouter = require('./routes/repository')
const connectToDatabase = require("./config/db")
const expressLayouts = require('express-ejs-layouts')
require('./config/passport')(passport);

// Database connection
connectToDatabase()

const app = express()

// Template engine and static
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(express.static(__dirname + '/public'));

// PORT
const PORT = process.env.PORT || 4000

// multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp.sync('uploads/')
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
app.use(multer({storage: storage}).single("filedata"));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// express body parser
app.use(express.urlencoded({extended: true}));

// express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: {_expires: 900000}
    })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.isLoggedIn = req.isAuthenticated();
    res.locals.username = req.user == undefined ? '' : req.user.username
    res.locals.isAdmin = req.user == undefined ? '' : req.user.isAdmin
    next();
});

// routes
app.use("/user", userRouter)
app.use("/file", fileRouter)
app.use("/", indexRouter)
app.use("/repository", repositoryRouter)

//Google oAauth2
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

// production error handler
app.use(function (req, res, next) {
    res.status(404).render('404')
});

app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`)
})