const express = require("express");
const router = express.Router();
router.use(express.json());
const bodyParser = require("body-parser");
const classes = require("../models/classes");
const users = require("../models/users")
const payments = require("../models/payments")
router.use(bodyParser.urlencoded({ extended: true }));
router.use(require("../session"));

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
const getUsers = () => {
    return new Promise((resolve) => {
        users
        .find({})
        .lean()
        .then((usersData) => {
            resolve(usersData);
        });
    });
};
const getPayments = () => {
    return new Promise((resolve) => {
        payments
        .find({})
        .lean()
        .then((paymentsData) => {
            resolve(paymentsData);
        });
    });
};
router.get("/", async (req, res) => {

    if (req.session.loggedInUser === undefined) {
      res.render("login", { 
        layout: "primary",
        cssFile: "loginPage.css",
        msg:"Must be logged in to delete user",
        msg_class:"fail" });
    }
    if (req.session.loggedInUser.isAdmin === true) {
        const classesData = await getClasses();
        const usersData = await getUsers();
        const paymentsData = await getPayments();
        return res.render("admin",{
          layout:"protected",
          classesData:classesData,
          usersData:usersData,
          paymentsData:paymentsData,
          cssFile:"admin.css",
          user:req.session.loggedInUser
          })
    } else {
      res.render("login", { 
        layout: "primary", 
        cssFile: "loginPage.css",
        msg:"Unauthorized",
        msg_class:"fail" });
    }
});
module.exports = router;
