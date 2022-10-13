// start of boiler plate
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use("/public", express.static("public"));
app.use(express.static("public"));
// connect to db
require("./db").connectDb();
app.use(express.json());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const exphbs = require("express-handlebars");
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      json: (context) => {
        return JSON.stringify(context);
      },
    },
  })
);
app.set("view engine", ".hbs");
app.use(require("./session"));

// Routes Endpoints
app.use("/users", require("./routes/users"));
app.use("/classes", require("./routes/classes"));
app.use("/cartItems", require("./routes/cartItems"));
app.use("/checkout", require("./routes/checkout"));
app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));
app.use("/admin", require("./routes/admin"));

const error404 = {
  status: 404,
  heading: "404",
  message: "Requested resource is not found in the server",
};
app.get("/", (req, res) => {
  if (req.session.loggedInUser === undefined) {
    return res.render("hero", { layout: "primary", cssFile: "heroPage.css" });
  } else {
    return res.render("hero", { layout: "protected", cssFile: "heroPage.css",user:req.session.loggedInUser });
  }
});
// Endpoints with only one action
app.get("/logout", (req, res) => {
  req.session.loggedInUser = undefined;
  return res.redirect("/");
});

// catch all route
app.use((req, res) => {
  res.render("error", {
    layout: "primary",
    data: error404,
    cssFile: "error.css",
  });
});

const startServer = () => {
  console.log(`The server is running on http://localhost:${port}`);
  console.log(`Press CTRL + C to exit`);
};
app.listen(port, startServer);
