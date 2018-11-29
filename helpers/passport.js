const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const { JWT_SECRET } = require("../config/key");
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
        const user = await User.findOne({ "local.email" : email });
        if (!user) {
          return done(null, false);
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
          console.log("not a match");
          return done(null, false);
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
      clientID:
        "575920411579-kf6cbm94mc0jham896hg6ctjke6hvees.apps.googleusercontent.com",
      clientSecret: "Nf-TSE872PnHLBsoup_AKKJc"
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
      clientID:
        "263066714559047",
      clientSecret: "f3cb13352f2df4f45ab4bc976b487933"
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
      clientID:
        "1975c5e0189d27270bc5",
      clientSecret: "4f962355dd1df2fe1e5f1f849c3cef3370e9604d",
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

