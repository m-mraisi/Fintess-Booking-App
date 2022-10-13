const express = require("express");
const router = express.Router();
const classes = require("../models/classes");
router.use(express.json());
const cartItems = require("../models/cartItems");
router.use(require("../session"));

const getCartItems = () => {
  return new Promise((resolve) => {
    cartItems
      .find({})
      .lean()
      .then((cartDetails) => {
        resolve(cartDetails);
      });
  });
};

const getClasses = () => {
  return new Promise((resolve) => {
    classes
      .find({})
      .lean()
      .then((classesData) => {
        resolve(classesData);
      });
  });
};

const getClass = (id) => {
  return new Promise((resolve) => {
    classes
      .findOne({ id: id })
      .lean()
      .then((classData) => {
        resolve(classData);
      });
  });
};

router.get("/", async (req, res) => {
  const classesData = await getClasses();
  if (req.session.loggedInUser === undefined) {
    // if user isn't logged in yet, then show classes with primary layout
    res.render("classes", {
      layout: "primary",
      classesData: classesData,
      cssFile: "classesPage.css",
    });
  } else {
    //valid session we pass the email
    const stringDetails = req.session.loggedInUser;
    const cartItems = await getCartItems(); // now we will get the cartItems for the corsponding user email
    classesData.map((item, i) => {
      const checkIfInCart = cartItems.filter(
        (inCartItem) =>
          inCartItem.class_id === item.id &&
          inCartItem.email === stringDetails.email
      );
      if (checkIfInCart.length) {
        // if the class already in cart then we will dsiable the "add to cart" button for it
        // item already in cart
        classesData[i].disabled = "disabled";
      } else {
        classesData[i].disabled = "";
      }
    });
    res.render("classes", {
      layout: "protected",
      classesData: classesData,
      cssFile: "classesPage.css",
      user: stringDetails,
    });
  }
});

// admin part - jacob part
const error404 = {
  status: 404,
  heading: "404",
  message: "Requested resource is not found in the server",
};
router.get("/update/:classId", async (req, res) => {
  if (req.session.loggedInUser === undefined) {
    res.render("login", {
      layout: "primary",
      cssFile: "loginPage.css",
      msg: "Must be logged in to update classes",
      msg_class: "fail",
    });
  }
  if (req.session.loggedInUser.isAdmin === true) {
    const classExist = await classes.findOne({id:req.params.classId})
    if(classExist!==null){
      const classData = await getClass(req.params.classId);
      res.render("update", {
        layout: "protected",
        cssFile: "signupPage.css",
        user: req.session.loggedInUser,
        classId: req.params.classId,
        className: classData.className,
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

router.put("/update/:id", async (req, res) => {
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
    const updId = req.params.id;
    const defaultClass = await classes.findOne({ id: updId });
    const regSpecial = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (
      data.classInstructor.match(regSpecial) ||
      /\d/.test(data.classInstructor)
    ) {
      res
        .status(500)
        .json({ msg: "name should not contain special characters or numbers" });
      return;
    }

    if (
      data.classInstructor.trim() === "" ||
      data.classInstructor === undefined
    ) {
      data.classInstructor = defaultClass.name;
    }
    const filter = { id: req.params.id };
    const updates = {
      classInstructor: data.classInstructor,
    };
    const updatedClass = await classes.findOneAndUpdate(filter, updates, {
      new: true,
    });
    if (updatedClass === undefined) {
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
module.exports = router;
