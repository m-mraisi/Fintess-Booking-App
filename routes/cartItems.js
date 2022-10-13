const express = require("express");
const router = express.Router();
const cartItems = require("../models/cartItems");
router.use(require("../session"));

// add items to cart
router.post("/", async (req, res) => {
  const items = req.body;
  const loggedInUser = req.session.loggedInUser;
  if (loggedInUser === undefined) {
    // when user clicks on book now and they Haven't loggedin yet -- redirected to the login page
    return res.redirect("/login");
  }
  const itemExists = await cartItems.findOne({
    // check if the item already in cartItems collection before adding (to avoid duplications)
    email: items.email,
    class_id: parseInt(items.class_id),
  });
  if (itemExists !== null) {
    // item already exists
    return res.redirect("/classes");
  }
  const itemToAdd = {
    class_id: parseInt(items.class_id),
    email: items.email,
    className: items.className,
    classDuration: parseInt(items.classDuration),
    classInstructor: items.classInstructor,
  };
  console.log(itemToAdd);
  cartItems(itemToAdd)
    .save()
    .then((results) => {
      return res.redirect(`/classes#${items.class_id}`);
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/classes");
    });
});

// delete classes/items based on email and classId (used when REMOVE is clicked on checkout page)
router.delete("/:classId", (req, res) => {
  const userEmail = req.session.loggedInUser.email;
  cartItems
    .deleteOne({
      email: userEmail,
      class_id: parseInt(req.params.classId),
    })
    .then((results) => {
      console.log(results);
      if (!results.deletedCount) {
        res
          .status(200)
          .json({ msg: `no items found under email: ${userEmail}` });
        return;
      }
      res.status(200).json({ msg: `item has been  deleted successfully` });
      return;
    })
    .catch((err) => {
      res.status(500).json({ msg: JSON.stringify(err) });
      return;
    });
});

module.exports = router;
