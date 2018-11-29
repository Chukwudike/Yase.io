const mongoose = require("mongoose");
const Token = require("../model/token");
const User = require("../model/User");
const router = require("express").Router();
const { validateBody, schemas } = require("../helpers/validator");
const userController = require('../controllers/userController')

// @route   GET api/users/test
// @desc    Test
// @access  Public

router.get("/test", userController.test );

// @route   GET api/users/signup
// @desc    Register user
// @access  Public
router.post("/signup/:type", validateBody(schemas.authSchema),userController.signup);

module.exports = router;
