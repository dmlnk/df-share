const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require("./defaults")

module.exports = function (passport) {
    let google = false;

    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            User.findOne({
                email: email
            }).then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            });
        })
    );

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/google/callback"
    },
        function (accessToken, refreshToken, profile, done) {
            google = true
            User.findOne({ email: profile.emails[0].value }).then((user) => {
                if (user) {
                    done(null, user);
                } else {
                    const newUser = new User({
                        username: profile.name.givenName + profile.name.familyName,
                        email: profile.emails[0].value,
                        password: profile._json.sub,
                        isAdmin: false,
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then((user) => {
                                    return done(null, newUser);
                                })
                                .catch((err) => console.log(err));
                        });
                    });
                }
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};