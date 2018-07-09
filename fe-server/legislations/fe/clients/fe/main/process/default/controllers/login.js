const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const passportJWT = require("passport-jwt");
// const JWTStrategy   = passportJWT.Strategy;
// const ExtractJWT = passportJWT.ExtractJwt;


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});



passport.use(new LocalStrategy(
       {usernameField:"username", passwordField:"password"},
        function (username, password, done) {
        if (username === 'foo' && password === 'bar') {
            done(null, true);
        } else {
            done(null, false);
        }
    }));
    
// passport.use(new JWTStrategy({
//         jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//         secretOrKey   : 'your_jwt_secret'
//     },
//     function (jwtPayload, cb) {
//         //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
//         return UserModel.findOneById(jwtPayload.id)
//             .then(user => {
//                 return cb(null, user);
//             })
//             .catch(err => {
//                 return cb(err);
//             });
//     }
// ));
    module.exports = passport.initialize();