const express = require("express");
const router = express.Router();
const users = require("../models/users");
router.use(require("../session"));

// admin routers --- jacob
const error404 = {
  status: 404,
  heading: "404",
  message: "Requested resource is not found in the server",
};
// rendering the update page (admin action)
router.get("/update/:email", async (req, res) => {
  if (req.session.loggedInUser === undefined) {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Must be logged in to update user",
      msg_class: "fail",
    });
  }
  if (req.session.loggedInUser.isAdmin === true) {
    //check if the parameter email actually exists
    const emailExist = await users.findOne({email:req.params.email})
    if(emailExist !== null){
      //allow to enter update user page
      res.render("update", {
        layout: "protected",
        cssFile: "signupPage.css",
        user: req.session.loggedInUser,
        updateEmail: req.params.email,
      });
    } else {
      res.render("error", {
        layout: "primary",
        data: error404,
        cssFile: "error.css",
      });
    }
  } else {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Unauthorized",
      msg_class: "fail",
    });
  }
});

// updating a user "username" base on their email -- Admin action
router.put("/update/:email", async (req, res) => {
  if (req.session.loggedInUser === undefined) {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Must be logged in to update user",
      msg_class: "fail",
    });
  }
  if (req.session.loggedInUser.isAdmin === true) {
    const data = req.body;
    console.log(data);
    const updEmail = req.params.email;
    const regEmail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // email pattern
    const regSpecial = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (
      updEmail === undefined ||
      updEmail.trim() === "" ||
      !updEmail.match(regEmail)
    ) {
      res.status(500).json({ msg: "Please insert a valid email" });
      return;
    }
    const defaultUser = await users.findOne({ email: updEmail });
    if (data.name.match(regSpecial) || /\d/.test(data.name)) {
      res
        .status(500)
        .json({ msg: "name should not contain special characters or numbers" });
      return;
    }

    //if name or password from request body is empty set it to their current name or password
    if (data.name.trim() === "" || data.name === undefined) {
      data.name = defaultUser.name;
    }
    if (data.password.trim() === "" || data.password === undefined) {
      data.password = defaultUser.password;
    }
    // https://mongoosejs.com/docs/tutorials/findoneandupdate.html
    const filter = { email: req.params.email };
    const updates = {
      name: data.name,
      password: data.password,
    };
    const updatedUser = await users.findOneAndUpdate(filter, updates, {
      new: true,
    });
    if (updatedUser === undefined) {
      // means something wrong with update.
      return res.status(500).redirect("/admin");
    } else {
      return res.status(200).redirect("/admin");
    }
  } else {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Unauthorized",
      msg_class: "fail",
    });
  }
});

// delete user -- admin action
router.delete("/delete/:delEmail", async (req, res) => {
  if (req.session.loggedInUser === undefined) {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Must be logged in to delete user",
      msg_class: "fail",
    });
  }
  if (req.session.loggedInUser.isAdmin === true) {
    //allow to delete
    const userToDelete = req.params.delEmail;
    console.log(`email to delete ${userToDelete}`);
    const regEmail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // email pattern
    if (!userToDelete.match(regEmail)) {
      return res.redirect("/admin");
    }
    //https://www.geeksforgeeks.org/mongoose-findoneanddelete-function/
    users.findOneAndDelete({ email: userToDelete }, (err, docs) => {
      if (err) {
        return res.status(500).redirect("/admin");
      } else {
        console.log(docs);
        return res.status(200).redirect("/admin");
      }
    });
  } else {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Unauthorized",
      msg_class: "fail",
    });
  }
});

module.exports = router;
