const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure the Google strategy
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: '/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
    // Logic for user registration or login
    // Example:
    User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) return done(err);
        if (!user) {
            user = new User({ googleId: profile.id, displayName: profile.displayName });
            user.save(err => {
                if (err) return done(err);
                return done(null, user);
            });
        } else {
            return done(null, user);
        }
    });
}));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
