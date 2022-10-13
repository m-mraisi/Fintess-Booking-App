const express = require("express");
const router = express.Router();
const cartItems = require("../models/cartItems");
const payments = require("../models/payments");
router.use(require("../session"));
const crypto = require("crypto"); // generate a transaciton number

const getBill = (cartitems) => {
  return new Promise(async (resolve) => {
    let subtotal = 0;
    for (let index = 0; index < cartitems.length; index++) {
      const item = cartitems[index];
      subtotal += 0.58 * parseFloat(item.classDuration);
    }
    const bill = {
      subtotal: subtotal.toFixed(2),
      tax: (subtotal * 0.13).toFixed(2),
      total: (subtotal * 0.13 + subtotal).toFixed(2),
    };
    resolve(bill);
  });
};

router.get("/", async (req, res) => {
  // render the checkout page
  const loggedInUser = req.session.loggedInUser;
  if (loggedInUser === undefined) {
    return res.redirect("/login");
  }
  const items = await cartItems
    .find({
      email: loggedInUser.email.toLowerCase(),
    })
    .lean();
  if (!items.length) {
    // the user hasn't picked any class yet
    return res.redirect("classes");
  }
  const bill = await getBill(items);
  return res.render("checkout", {
    layout: "protected",
    cssFile: "checkoutPage.css",
    bill: bill,
    classes: items,
    user: loggedInUser,
  });
});

const PayInfoValidation = (data) => {
  const regEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // email pattern
  const regExpiryDate = "[0-9]{2}[/][0-9]{2}";
  const regCNN = "[0-9s]{13,19}";
  if (data.customerName.trim() === "" || data.customerName === undefined) {
    return {
      status: false,
      msg: "Please insert a valid name",
    };
  }
  if (
    data.customerEmail === undefined ||
    data.customerEmail.trim() === "" ||
    !data.customerEmail.match(regEmail)
  ) {
    return {
      status: false,
      msg: "Please insert a valid email",
    };
  }
  if (
    data.ccn === undefined ||
    data.ccn.trim() === "" ||
    !data.ccn.match(regCNN)
  ) {
    return {
      status: false,
      msg: "Please insert a vaild credit card number",
    };
  }
  if (
    data.expiryDate === undefined ||
    data.expiryDate.trim() === "" ||
    !data.expiryDate.match(regExpiryDate)
  ) {
    return {
      status: false,
      msg: "Please follow the expiry date pattern (MM/YY)",
    };
  }

  return {
    status: true,
    msg: null,
  };
};

const addPaymentToDB = (paymentToAdd) => {
  return new Promise((resolve) => {
    payments(paymentToAdd)
      .save()
      .then((resuls) => {
        console.log("payment addedd", resuls);
        resolve({
          status: true,
          msg: null,
        });
      })
      .catch((err) => {
        console.log(err);
        resolve({
          status: false,
          msg: JSON.stringify(err),
        });
      });
  });
};

const deleteCartItems = (email) => {
  return new Promise((resolve) => {
    cartItems
      .deleteMany({ email: email })
      .then((results) => {
        console.log("items deleted", results.deletedCount);
        resolve(results);
      })
      .catch((err) => {
        console.log(err);
        resolve(err);
      });
  });
};

router.post("/", async (req, res) => {
  console.log(req.body);
  const loggedInUser = req.session.loggedInUser;
  const data = req.body;
  const items = await cartItems
    .find({
      email: loggedInUser.email.toLowerCase(),
    })
    .lean();
  const bill = await getBill(items);

  const validateInfo = await PayInfoValidation(data);
  if (!validateInfo.status) {
    // if the validation status is false
    return res.render("checkout", {
      layout: "protected",
      cssFile: "checkoutPage.css",
      bill: bill,
      classes: items,
      msg: validateInfo.msg,
      msg_class: "fail",
      user: loggedInUser,
    });
  }
  if (data.JoinAsMember === "Yes") {
    console.log("yes joined");
    const pass = parseInt(data.MonthlyPass);
    const total = (pass * 0.13 + pass).toFixed(2);
    // add transaction to the payments module
    console.log("total", total);
    const transactionId = crypto.randomBytes(16).toString("hex");
    let itemName;
    if (pass === 35) {
      itemName = "Monthly Pass";
    } else if (pass === 150) {
      itemName = "Quarterly Pass";
    } else {
      itemName = "Yearly Pass";
    }
    paymentToAdd = {
      id: transactionId,
      email: data.customerEmail,
      total: total,
      items: [
        {
          itemName: itemName,
          unitPrice: pass,
        },
      ],
    };
    console.log(paymentToAdd);
    const addPayment = await addPaymentToDB(paymentToAdd);
    if (!addPayment.status) {
      return res.render("checkout", {
        layout: "protected",
        cssFile: "checkoutPage.css",
        bill: bill,
        classes: items,
        msg: addPayment.msg,
        msg_class: "fail",
        user: loggedInUser,
      });
    }
    // delete all cart items for the corsponding customer
    const deleteItems = await deleteCartItems(loggedInUser.email.toLowerCase());
    // render the successfull page
    return res.render("payments", {
      layout: "protected",
      cssFile: "payments.css",
      data: {
        heading: `The transactions has been completed successfully`,
        message: `Your transaction number is ${transactionId}`,
      },
      user: loggedInUser,
    });
  } else {
    // prepare payment payload
    const lines = [];
    let total = 0;
    items.map((item) => {
      lines.push({
        itemName: item.className,
        unitPrice: parseFloat((parseInt(item.classDuration) * 0.58).toFixed(2)),
      });
      total += parseFloat(parseInt(item.classDuration) * 0.58);
    });
    total = (total * 1.13).toFixed(2);
    const transactionId = crypto.randomBytes(16).toString("hex");
    paymentToAdd = {
      id: transactionId,
      email: data.customerEmail,
      total: total,
      items: lines,
    };
    const addPayment = await addPaymentToDB(paymentToAdd);
    if (!addPayment.status) {
      // if there's an issue wiht the payment
      return res.render("checkout", {
        layout: "protected",
        cssFile: "checkoutPage.css",
        bill: bill,
        classes: items,
        msg: addPayment.msg,
        msg_class: "fail",
        user: loggedInUser,
      });
    }
    // delete all cart items for the corsponding customer
    const deleteItems = await deleteCartItems(loggedInUser.email.toLowerCase());
    // render the successfull page
    return res.render("payments", {
      layout: "protected",
      cssFile: "payments.css",
      data: {
        heading: `The transactions has been completed successfully`,
        message: `Your transaction number is ${transactionId}`,
      },
      user: loggedInUser,
    });
  }
});

module.exports = router;
