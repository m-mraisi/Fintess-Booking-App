const express = require("express");
const router = express.Router();
const session = require("express-session");

module.exports = router.use(
  session({
    secret: "a random text for the session",
    resave: true,
    saveUninitialized: true,
  })
);
