const unifillCheckout = document.querySelector("#unifill-checkout");
unifillCheckout.addEventListener("click", (e) => {
    console.log("Clicked on the checkout button");
})

var modal = document.getElementById("myModal");
var btn = document.getElementById("unifill-checkout");
var closeBtn = document.getElementsByClassName("close")[0];
var submitMobile = document.getElementById("submit-mobile");
var submitOtp = document.getElementById("submit-otp");
var inputField = document.getElementById("mobile-number");
var otpInput = document.getElementById("otp-input");
var checkoutBtn = document.getElementById("checkout");

btn.onclick = function() {
  modal.style.display = "block";
}

async function fetchCart(mobileNumber) {
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": atob(window.Unifill.client, 'base64')
    }
  };
  return await fetch(window.Shopify.routes.root + `apps/unifill/auth/v1/otp?mobile=${mobileNumber}`, fetchOptions).then((fulfilled => fulfilled));
}

function manageFetchOtp(resp) {
  console.log(resp);
  const otpRequestId = resp['otp_request_id'];

  if(!!otpRequestId) {
    this.saveOtpRequestId(otpRequestId);
  }
}

saveOtpRequestId = (otpRequestId) => {
  return window.Unifill.otpRequestId = otpRequestId;
}

submitMobile.addEventListener("click", (e) => {
  fetchCart(inputField.value).then(response => response.json().then(fulfilled => manageFetchOtp(fulfilled)));
});

submitOtp.addEventListener("click", (e) => {
  fetchAddresses(otpInput.value).then(response => response.json().then(fulfilled => manageFetchAddresses(fulfilled)));
});

async function fetchAddresses(otp) {
  const fetchOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": atob(window.Unifill.client, 'base64')
    }
  };

  const bodyParams = new URLSearchParams({
    otp: otp,
    otp_request_id: window.Unifill.otpRequestId,
    mobile: inputField.value
  });

  return await fetch(window.Shopify.routes.root + `apps/unifill/v1/addresses?` + bodyParams, fetchOptions).then((fulfilled => fulfilled));
  
}

function manageFetchAddresses(resp) {
  let htmlString = "";
  window.Unifill.addressList = [];
  resp.address_list.forEach((address, addressIdx) => {
    window.Unifill.addressList.push(address);
    htmlString += `<input type="radio" name="address_option" value="${addressIdx}">${address.name}, ${address.address_line1}, ${address.state}, ${address.pin_code}, ${address.city}, ${address.country}</input>`;
  });

  document.getElementById("address_list").innerHTML = htmlString;
}

closeBtn.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

checkoutBtn.addEventListener("click", (e) => {
  const selectedAddress = document.querySelector("#address_list input[type='radio']:checked").value;
  const address = window.Unifill.addressList[selectedAddress];
  alert(`/checkout?checkout[shipping_address][first_name]=${address.name}&checkout[shipping_address][address1]=${address.address_line1}&checkout[shipping_address][city]=${address.city}&checkout[shipping_address][zip]=${address.pin_code}&checkout[shipping_address][country]=${address.country}&checkout[shipping_address][province]=${address.state}&checkout[shipping_address][phone]=${inputField.value}&checkout[phone]=${inputField.value}`);
  window.location = `/checkout?checkout[shipping_address][first_name]=${address.name}&checkout[shipping_address][address1]=${address.address_line1}&checkout[shipping_address][city]=${address.city}&checkout[shipping_address][zip]=${address.pin_code}&checkout[shipping_address][country]=${address.country}&checkout[shipping_address][province]=${address.state}&checkout[shipping_address][phone]=${inputField.value}&checkout[phone]=${inputField.value}`
});