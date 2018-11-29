const Token = require("../model/token");
const User = require("../model/User");
const crypto = require("crypto");

module.exports = {
  test: (req, res) => {
    res.status(200).json({ msg: "a test route" });
  },
  signup: async (req, res, next) => {
    const { email, password } = req.value.body;
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
        local: { email: email, password: password }
      });
      const user = await newUser.save();
      crypto.randomBytes(16, (err, buffer) => {
        if (err) throw err;
        const token = buffer.toString("hex");
        console.log(token);
        const savetoken = new Token({
          _userId: user.id,
          token
        })
          .save()
          .then(savedToken => {
            res.send(savedToken);
          })
          .catch(err => {
            res.status(400).json(err);
          });
      });
    } catch (err) {
      res.send(err);
    }

    // send email

    //const token = signToken(newUser);

    //res.status(200).json(token);
  }
};
