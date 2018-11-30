const Token = require("../model/Token");
const User = require("../model/User");
const crypto = require("crypto");
const { signToken } = require("../helpers/signToken");
const { gmail } = require("../config/key");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmail.email,
    pass: gmail.password
  }
});

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
            // send email token

            const mailOptions = {
              from: " yase.io <foo@example.com>", // sender address
              to: `${user.local.email}`, // list of receivers
              subject: "Email verification from Yase", // Subject line
              html: `<p> Dear ${
                user.local.name
              }, Thank you for registering into Yase! We are stoked to have you. Kindly complete your registration by clicking on the button below to activate your account!
              <br>
              <a href = "http://localhost:5000/api/users/signup/confirmation/${
                savedToken.token
              }">Sign up</a>
              </p>
              ` // plain text body
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              res.status(200).json({
                message:
                  "Please activate your account, an email has been sent to you!"
              });
            });
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
    const { email } = req.body;
    const user = await User.findOne({ "local.email" : email });
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

          // send email

          const mailOptions = {
            from: " yase.io", // sender address
            to: `${email}`, // list of receivers
            subject: "New Email Token from Yase", // Subject line
            html: `<p> Dear ${user.local.name}, Kindly verify your account!
            <br>
            <a href = "http://localhost:5000/api/users/signup/confirmation/${
              savedToken.token
            }">Verify Account</a>
            </p>
            ` // plain text body
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            res.status(200).json({
              message:
                "New verification token has been sent"
            });
          });
        });
    });
  },
  signinLocally: async (req, res) => {
    User.findOne;
    const token = signToken(req.user);
    res.status(200).json(token);
  },

  googleAuth: async (req, res) => {
    const token = signToken(req.user);
    res.status(200).json(token);
  },
  facebookAuth: async (req, res) => {
    const token = signToken(req.user);
    res.status(200).json(token);
  },
  githubAuth: async (req, res) => {
    const token = signToken(req.user);
    res.status(200).json(token);
  }
};
