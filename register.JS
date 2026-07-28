import { createClient } from 
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl =
"https://tvhgxlqqeklrdlgbkosa.supabase.co";

const supabaseKey =
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I";

const supabase =
createClient(supabaseUrl,supabaseKey);

const form =
document.getElementById("registerForm");

const popup =
document.getElementById("otpPopup");

const verifyBtn =
document.getElementById("verifyOtpBtn");

form.addEventListener("submit", async(e)=>{

e.preventDefault();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

if(password.length < 6){
  alert("Password must be at least 6 characters");
  return;
}


try {

const response =
await fetch("/.netlify/functions/send",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email
})

});


const result =
await response.json();


if(result.success){

popup.style.display="flex";

}
else{

alert(result.error);

}

} catch(error) {

alert(error.message);

}

});


verifyBtn.addEventListener("click",async()=>{

const email =
document.getElementById("email").value.trim();

const otp =
document.getElementById("otpInput").value.trim();

if(otp.length !== 6){

alert("Enter 6 digit OTP");
return;

}

const response =
await fetch("/.netlify/functions/verify-otp",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email:email,
otp:otp

})


});

const result =
await response.json();

if(result.success){

const username =
document.getElementById("username").value.trim();

const password =
document.getElementById("password").value.trim();


const {data,error} =
await supabase.auth.signUp({

email,
password

});


if(error) throw error;

const { error: profileError } = await supabase
.from("profiles")
.insert({
  id:data.user.id,
  username:username,
  email:email
});

if(profileError){
  throw profileError;
}

popup.style.display="none";

document.getElementById("successMsg").style.display="block";

setTimeout(()=>{

window.location.href="index.html";

},2000);

}

else{

alert("Wrong OTP");

}

});