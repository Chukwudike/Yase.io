const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcryptjs = require("bcryptjs");

const userSchema = new Schema({
  method: {
    type: String,
    enum: ["local", "google", "facebook", "github"],
    required: true
  },
  account_type: {
    type: String,
    enum: ["admin", "company", "dev"],
    required: true,
    default : "dev"
  },
  local: {
    name: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  google: {
    name: {
      type: String
    },
    id: {
      type: String
    },
    email: {
      type: String
    }
  },
  facebook: {
    name: {
      type: String
    },
    id: {
      type: String
    },
    email: {
      type: String
    }
  },
  github: {
    name: {
      type: String
    },
    id: {
      type: String
    },
    email: {
      type: String
    }
  },
  image: {
    type: String
  },
  createdAt: { type: Date, required: true, default: Date.now }
});

// userSchema.pre("save", async function(next) {
//   if (this.method !== "local") {
//     next();
//   }
//   try {
//     const salt = await bcryptjs.genSalt(10);
//     const passwordHash = await bcryptjs.hash(this.local.password, salt);
//     this.local.password = passwordHash;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// userSchema.methods.isValidPassword = async function(newPassword) {
//   try {
//     return await bcryptjs.compare(newPassword, this.local.password);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

module.exports = mongoose.model("User", userSchema);
