require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");

//define port
const PORT = process.env.PORT || 3500;

//connect to MongoDB
connectDB();

//custom middleware logger
/* app.use((req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.txt");
  console.log(`${req.method} ${req.path}}`);
  next();
}); */

app.use(logger);

//handle options credentials check before CORS and fetch cookies credentials requirement
app.use(credentials);

//cross origin resource sharing
app.use(cors(corsOptions));

//built in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

//built in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files like css and images
app.use("/", express.static(path.join(__dirname, "/public")));
/* app.use("/subdir", express.static(path.join(__dirname, "/public"))); */

//routes
app.use("/", require("./routes/root"));
/* app.use("/subdir", require("./routes/subdir")); */
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT); //accessing employees needs verification
app.use("/employees", require("./routes/api/employees"));

//default
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html")); //200 by default
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//custom error handling
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  //listen for requests only if successfully connected to mongoDB
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
