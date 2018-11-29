const {JWT_SECRET} = require("../config/key");
const JWT = require("jsonwebtoken");

module.exports = {
    signToken : user => {
        return JWT.sign(
          {
            iss: "Dikky",
            sub: user.id,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 1)
          },
          JWT_SECRET
        );
      }
}
