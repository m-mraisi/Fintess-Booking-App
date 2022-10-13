const express = require("express");
const router = express.Router();
const users = require("../models/users");
router.use(require("../session"));

router.get("/", (req, res) => {
  res.render("login", { layout: "primary", cssFile: "loginPage.css" });
});

router.post("/", async (req, res) => {
  const userEmail = req.body.userEmail.toLowerCase();
  const userPassword = req.body.userPassword;
  const regEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // email pattern
  if (
    userEmail === undefined ||
    userEmail.trim() === "" ||
    !userEmail.match(regEmail)
  ) {
    return res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Please insert a valid email",
      msg_class: "fail",
    });
  }
  if (userPassword.trim() === "" || userPassword === undefined) {
    return res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Please insert a valid password",
      msg_class: "fail",
    });
  }
  const checkUser = await users.findOne({ email: userEmail });
  if (checkUser === null) {
    // this means the suer does not exist in the db
    return res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "No matching user found",
      msg_class: "fail",
    });
  } else {
    // user found in db
    if (userPassword === checkUser.password) {
      req.session.loggedInUser = checkUser;
      //check if user is admin
      if (checkUser.isAdmin === true) {
        return res.redirect("admin");
      } else {
        return res.redirect("classes");
      }
    } else {
      return res.render("login", {
        layout: "primary",
        cssFile: "loginPage.css",
        msg: "Password does not match.",
        msg_class: "fail",
      });
    }
  }
});

module.exports = router;
