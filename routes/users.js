const mongoose = require("mongoose");
const Token = require("../model/Token");
const User = require("../model/User");
const router = require("express").Router();
const { validateBody, schemas } = require("../helpers/validator");
const userController = require("../controllers/userController");
const passport = require("passport");
require("../helpers/passport")

// @route   GET api/users/test
// @desc    Test
// @access  Public

router.get("/test", userController.test);

// @route   POST api/users/signup/:type
// @desc    Register user
// @access  Public
router.post(
  "/signup/:type",
  validateBody(schemas.authSchema),
  userController.signupLocally
);

// @route   GET api/users/signup/confirmation/:token
// @desc    Register user
// @access  Public
router.get("/signup/confirmation/:token", userController.confirmationEmail);

// @route   POST api/users/signup/resend_token
// @desc    Register user
// @access  Public
router.post(
  "/signup/resend_token",
  validateBody(schemas.emailSchema),
  userController.resendToken
);

// @route   POST api/users/signin/
// @desc    Login user
// @access  Public
router.post(
  "/signin",
  validateBody(schemas.loginSchema),
  passport.authenticate("local", { session: false }),
  userController.signinLocally
);
module.exports = router;
