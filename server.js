const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/key");
const morgan = require("morgan");

// initialize express app
const app = express();

//init mongoose
mongoose.Promise = global.Promise;
mongoose.connect(
  keys.mongoUrl,
  { useNewUrlParser: true },
  () => {
    console.log("mongo activated!");
  }
);
mongoose.set("useCreateIndex", true);

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.use("/api/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`I am listening to requests on port ${PORT}`);
});
