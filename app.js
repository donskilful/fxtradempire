const express = require('express');
flash = require("connect-flash");
session = require("express-session");
passport = require("passport");
mongoose = require("mongoose");
bcrypt = require("bcryptjs");
methodOverride          =require("method-override");
const { ensureAuthenticated, forwardAuthenticated } = require("./config/auth");

require("dotenv").config();


const app = express();

// Load User model
const User = require("./models/User");

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log("Database Connected"))
    .catch(err => console.log(err));

// ejs
app.set("view engine", "ejs");
app.use(express.static('public'));

// Express body parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// ROUTES

// index route
app.get('/', function (req, res) {
    res.render('index');
});

app.get('/index', function (req, res) {
    res.render('index');
});

// register route
app.get('/register', function (req, res) {
    res.render('register')
});

// login route
app.get('/login', function (req, res) {
    res.render('login');
});

// about route
app.get('/about', function (req, res) {
    res.render('about');
});

// contact route
app.get('/contact', function (req, res) {
    res.render('contact');
});

// market route
app.get('/market', function (req, res) {
    res.render('market');
});

// admin%_ route
app.get("/admin%_", function (req, res) {
    User.find({}, function (err, users) {
      if (err) {
        console.log("ERROR!");
      } else {
        res.render("admin%_", { users: users });
      }
    })
  });

// edit route
app.get("/admin%_/:id/edit", function(req, res){
    User.findById(req.params.id, function(err, founduser){
        if (err){
            res.redirect("/admin%_");
        }else{
            res.render("edit", {user: founduser});
        }
    });
});

// UPDATE ROUTE
app.put("/admin%_/:id", function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updateduser){
        if (err){
            res.redirect("/admin%_");
        }else{
            res.redirect("/admin%_/" + req.params.id);
        }
    });
});


// tradecenter route
app.get('/tradecenter', ensureAuthenticated, (req, res) => {
    res.render('tradecenter', {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone,
        country: req.user.country,
        balance: req.user.balance,
        progress: req.user.progress,
    });
});

// profile route
app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone,
        country: req.user.country,
        balance: req.user.balance,
        progress: req.user.progress,
    });
});

// deposit route
app.get('/deposit', ensureAuthenticated, (req, res) => {
    res.render('deposit', {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone,
        country: req.user.country,
        balance: req.user.balance,
        progress: req.user.progress,
    });
});

// withdrawal route
app.get('/withdrawal', ensureAuthenticated, (req, res) => {
    res.render('withdrawal', {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone,
        country: req.user.country,
        balance: req.user.balance,
        progress: req.user.progress,
    });
});

// wit handle
app.post('/wit', function (req, res) {
    console.log(req.body);
    const { btc, amount } = req.body;

    // check the length of bitcoin address
    if (btc.length < 30) {
        res.send('Invalid Bitcoin Address');
    }

    // check if amount is not a number
    if (isNaN(amount)) {
        res.send('Please enter a valid amount');
    } else {
        (balance -= amount);
        res.send('Withdrawal was successful')

    }
});

// upgradeaccount route
app.get('/upgradeaccount', ensureAuthenticated, (req, res) => {
    res.render('upgradeaccount', {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone,
        country: req.user.country,
        balance: req.user.balance,
        progress: req.user.progres
    });
});

// register handle
app.post("/register", (req, res) => {
    console.log(req.body);
    const { firstname, lastname, email, phone, country, password, confirm_password, btc, progress, balance } = req.body;
    let errors = [];

    // check required feilds
    if (!firstname || !lastname || !email || !phone || !country || !password || !confirm_password) {
        errors.push({ msg: "Please fill in all fields" });
    }

    // check password match
    if (password != confirm_password) {
        errors.push({ msg: "Passwords do not match" });
    }

    // check password length
    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters" });
    }

    if (errors.length > 0) {
        res.render("register", {
            errors,
            firstname,
            lastname,
            email,
            phone,
            country,
            balance,
            progress
        });
    } else {
        // validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // user exists
                    errors.push({ msg: 'Email already exists' });
                    res.render('register', {
                        errors,
                        firstname,
                        lastname,
                        phone,
                        country,
                        password,
                        confirm_password,
                        balance,
                        progress
                    });
                }
                else {
                    const newUser = new User({
                        firstname,
                        lastname,
                        email,
                        phone,
                        country,
                        password,
                        balance,
                        progress
                    });

                    // hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // set password to hashed
                            newUser.password = hash;
                            // save user
                            newUser
                                .save()
                                .then(user => {
                                    req.flash(
                                        'success_msg',
                                        'You are now registered and can log in'
                                    );
                                    res.redirect("/login");
                                })
                                .catch(err => console.log(err));
                        });
                    });

                }
            });
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/tradecenter',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});



const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server running on PORT ${PORT}`));