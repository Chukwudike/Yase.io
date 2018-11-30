const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const { JWT_SECRET } = require("../config/key")
const {google,facebook,github} = require("../config/key")
const GoogleStrategy = require("passport-google-plus-token");
const FacebookStrategy = require("passport-facebook-token");
const GithubStrategy = require("passport-github-token");
const LocalStrategy = require("passport-local");
const User = require("../model/User");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) {
          done(null, false);
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          $and: [{ "local.email": email }, { "local.isVerified": true }]
        });
        if (!user) {
          return done(null, false, {
            message: "email is not verified"
          });
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
          return done(null, false, {
            message: "Email or password is in valid"
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.use(
  "googleToken",
  new GoogleStrategy(
    {
      clientID: google.clientId,
      clientSecret: google.clientSecret
      //proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
          console.log(existingUser);
          return done(null, existingUser);
        }
        const user = await new User({
          account_type : req.params.type,
          method: "google",
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        }).save();

        done(null, user);
      } catch (err) {
        done(err, false, err.message);
      }
    }
  )
);

passport.use(
  "facebookToken",
  new FacebookStrategy(
    {
      clientID: facebook.clientId,
      clientSecret: facebook.clientSecret
      //proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) {
          console.log(existingUser);
          return done(null, existingUser);
        }
        const user = await new User({
          account_type : req.params.type,
          method: "facebook",
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        }).save();

        done(null, user);
      } catch (err) {
        done(err, false, err.message);
      }
    }
  )
);

passport.use(
  "githubToken",
  new GithubStrategy(
    {
      clientID: github.clientId,
      clientSecret: github.clientSecret,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, next) => {
      try {
        const existingUser = await User.findOne({ "github.id": profile.id });
        if (existingUser) {
          console.log(existingUser);
          return done(null, existingUser);
        }
        const user = await new User({
          account_type : req.params.type,
          method: "github",
          github: {
            id: profile.id,
            email: profile.emails[0].value
          }
        }).save();

        next(null, user);
      } catch (err) {
        next(err, false, err.message);
      }
    }
  )
);
