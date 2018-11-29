const Token = require("../model/Token");
const User = require("../model/User");
const crypto = require("crypto");
const { signToken } = require("../helpers/signToken");
const bcrypt = require("bcryptjs");

module.exports = {
  test: (req, res) => {
    res.status(200).json({ msg: "a test route" });
  },

  signupLocally: async (req, res, next) => {
    const { email, password, name } = req.value.body;
    const email_exists = await User.findOne({
      "local.email": req.value.body.email
    });
    if (email_exists) {
      return res.status(401).json({ error: "email is already in use" });
    }
    try {
      const newUser = new User({
        account_type: req.params.type,
        method: "local",
        local: { name, email, password }
      });

      //Hash password

      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(newUser.local.password, salt);
      newUser.local.password = passwordHash;

      const user = await newUser.save();
      // Create email confirmation token
      crypto.randomBytes(16, (err, buffer) => {
        if (err) throw err;
        const token = buffer.toString("hex");
        new Token({
          _userId: user.id,
          token
        })
          .save()
          .then(savedToken => {
            res.send(savedToken);
            // send email token
          })
          .catch(err => {
            res.status(400).json(err);
          });
      });
    } catch (err) {
      res.send(err);
    }
  },

  confirmationEmail: async (req, res) => {
    //Find a matching Token'
    try {
      const token = await Token.findOne({ token: req.params.token });
      if (!token) {
        return res.status(400).json({
          type: "not-verified",
          msg:
            "We were unable to find a valid token. Your token my have expired."
        });
      }

      //If we found token, find a matching user
      const user = await User.findById(token._userId);
      if (!user) {
        return res
          .status(400)
          .json({ msg: "We were unable to find a user for this token." });
      }

      //check if user is verifed
      if (user.local.isVerified)
        return res.status(400).json({
          type: "already-verified",
          msg: "This user has already been verified."
        });

      user.local.isVerified = true;
      const verified_user = await user.save();
      //Sign signin token
      const signin_token = signToken(verified_user);
      res.status(200).json(signin_token);
    } catch (err) {
      console.log(err);
    }
  },

  resendToken: async (req, res) => {
    const { email } = req.body.email;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "We were unable to find a user with that email." });
    if (user.local.isVerified)
      return res.status(400).json({
        msg: "This account has already been verified. Please log in."
      });

    //create verification token, save it and send it
    crypto.randomBytes(16, (err, buffer) => {
      if (err) throw err;
      const token = buffer.toString("hex");
      new Token({
        _userId: user.id,
        token
      })
        .save()
        .then(savedToken => {
          res.send(savedToken);
          // send email
        });
    });
  },
  signinLocally: async (req, res) => {
    const token = signToken(req.user);
    res.status(200).json(token);
  }
};
