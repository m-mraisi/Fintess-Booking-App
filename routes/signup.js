const express = require("express");
const router = express.Router();
const users = require("../models/users");

router.get("/", (req, res) => {
  res.render("signup", { layout: "primary", cssFile: "signupPage.css" });
});

const addUser = (userToAdd) => {
  return new Promise((resolve) => {
    users(userToAdd)
      .save()
      .then((results) => {
        resolve({
          status: true,
          msg: results,
        });
      })
      .catch((err) => {
        resolve({
          status: false,
          msg: err,
        });
      });
  });
};

// signing uo a new user
router.post("/", async (req, res) => {
  const data = req.body;
  const regEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // email pattern
  if (
    data.email === undefined ||
    data.email.trim() === "" ||
    !data.email.match(regEmail)
  ) {
    return res.render("signup", {
      layout: "primary",
      cssFile: "signupPage.css",
      msg: "Please insert a valid email",
      msg_class: "fail",
    });
  }
  if (data.name.trim() === "" || data.name === undefined) {
    return res.render("signup", {
      layout: "primary",
      cssFile: "signupPage.css",
      msg: "Please insert a valid name",
      msg_class: "fail",
    });
  }
  if (data.password.trim() === "" || data.password === undefined) {
    return res.render("signup", {
      layout: "primary",
      cssFile: "signupPage.css",
      msg: "Please insert a valid password",
      msg_class: "fail",
    });
  }
  const userToAdd = {
    name: data.name,
    email: data.email,
    password: data.password,
    isAdmin: false,
  };
  const userExists = await users.findOne({ email: data.email });
  // this means that if the query doesnt return the email they can signup to the system
  if (userExists === null) {
    const addedUser = await addUser(userToAdd);
    if (addedUser.status) {
      return res.render("login", {
        layout: "primary",
        cssFile: "loginPage.css",
        msg: "User Created! Please login",
        msg_class: "success",
      });
    } else {
      return res.render("signup", {
        layout: "primary",
        cssFile: "signupPage.css",
        msg: JSON.stringify(addedUser.msg),
        msg_class: "fail",
      });
    }
  } else {
    return res.render("signup", {
      layout: "primary",
      cssFile: "signupPage.css",
      msg: "Email Already taken!",
      msg_class: "fail",
    });
  }
});

module.exports = router;
