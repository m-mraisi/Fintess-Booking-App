const membershipHandle = () => {
  if (document.querySelector("#Radio-Member-Yes").checked === true) {
    document.querySelector("#MonthlyPass").removeAttribute("disabled");
    const pass = parseInt(document.querySelector("#MonthlyPass").value);
    let textToAdd;
    if (pass === 35) {
      textToAdd = "Monthly Pass - $35/mth";
    } else if (pass === 150) {
      textToAdd = "Quarterly Pass - $150/Quartor";
    } else {
      textToAdd = "Yearly Pass - $300/Year";
    }
    document.querySelector("#cart-classes").innerHTML = `
      <div id="cart-item" class="grid50">
            <p>${textToAdd}</p>
        </div>
        `;
    document.querySelector("#div-sub-tax").innerHTML = `
    <label for="">Subtotal:</label>
            <p id="subtotal">$${pass.toFixed(2)}</p>
            <label for="">Tax:</label>
            <p id="tax">$${(pass * 0.13).toFixed(2)}</p>`;

    document.querySelector("#div-total").innerHTML = `
            <label for="">Total:</label>
            <p id="total">$${(pass * 0.13 + pass).toFixed(2)}</p>`;
  } else {
    // the user did not choose to join the membership
    document.querySelector("#MonthlyPass").setAttribute("disabled", "");
    return window.location.replace("/checkout");
  }
  return;
};

const removeItem = (class_id) => {
  fetch(`/cartItems/${class_id}`, {
    method: "DELETE",
  }).then((res) => {
    return window.location.replace("/checkout");
  });
};

document
  .querySelector("#Radio-Member-Yes")
  .addEventListener("change", membershipHandle);
document
  .querySelector("#Radio-Member-No")
  .addEventListener("change", membershipHandle);

document
  .querySelector("#MonthlyPass")
  .addEventListener("change", membershipHandle);
