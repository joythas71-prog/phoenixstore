import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ================= FIREBASE CONFIG =================

const firebaseConfig = {
  apiKey: "AIzaSyABYByDW8bAOCHfCwcRNaSN1wwifQEhzA4",
  authDomain: "freefiretopup-bbb23.firebaseapp.com",
  projectId: "freefiretopup-bbb23",
  storageBucket: "freefiretopup-bbb23.firebasestorage.app",
  messagingSenderId: "305435218774",
  appId: "1:305435218774:web:d258e8218bd1bdec50fcf7"
};


// ================= INIT =================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ================= CURRENT USER =================

let currentUser = null;


// ================= LOAD PROFILE =================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;

  }

  currentUser = user;

  console.log("Logged in User UID:", user.uid);

  try {

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);


    if (userSnap.exists()) {

      const data = userSnap.data();


      // Username

      if (data.name) {

        document.getElementById("username").value = data.name;

      }


      // Email

      document.getElementById("email").value = data.email || user.email;


      // Profile Image

      if (data.img) {

        document.getElementById("profilePic").src = data.img;

      }

    } else {

      // If Firestore data not found

      document.getElementById("email").value = user.email;

    }


  } catch (error) {

    console.error("Profile load error:", error);

  }

});


// ================= UPLOAD BUTTON =================

window.uploadImg = function() {

  document.getElementById("upload").click();

};


// ================= CLOUDINARY IMAGE UPLOAD =================

window.profileImageURL = "";

document.getElementById("upload").addEventListener("change", async function() {

  const file = this.files[0];

  if (!file) return;

  const btn = document.getElementById("uploadBtn");

btn.innerText = "Uploading... ⏳";
btn.disabled = true;


  let formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "Phoenixstore_upload");


  try {

    let response = await fetch(
      "https://api.cloudinary.com/v1_1/lhv0ojre/image/upload",
      {
        method: "POST",
        body: formData
      }
    );


let data = await response.json();

if(data.secure_url){

  document.getElementById("profilePic").src = data.secure_url;

  window.profileImageURL = data.secure_url;

   btn.innerText = "Change Photo";
   btn.disabled = false;

showToast("Photo Upload Success ✅");

}else{

  alert("Cloudinary upload failed ❌");

}


  } catch(error) {

    console.error(error);

    alert("Photo Upload Failed ❌");

  }

});




// ================= SAVE PROFILE =================

window.saveProfile = async function() {

  if (!currentUser) {

    alert("Please login first");

    return;

  }


  const name = document.getElementById("username").value.trim();

  const email = document.getElementById("email").value.trim();

  const img = window.profileImageURL || document.getElementById("profilePic").src;


  if (!name) {

    alert("Please enter username");

    return;

  }

showToast("Uploading... Please wait ⏳");

  try {

    const userRef = doc(db, "users", currentUser.uid);


    await setDoc(userRef, {

      name: name,

      email: email,

      img: img

    }, { merge: true });


   showToast("Profile Saved Successfully ✅");


    window.location.href = "home.html";


  } catch (error) {

    console.error(error);

    alert("Profile save failed: " + error.message);

  }

};

// ================= LOGOUT =================

window.logoutUser = async function() {

  try {

    await signOut(auth);

    localStorage.removeItem("userId");
    localStorage.removeItem("currentUser");

    window.location.href = "index.html";

  } catch (error) {

    console.error(error);

    alert("Logout failed: " + error.message);

  }

};

window.showToast = function(message){

  const toast = document.getElementById("toast");

  toast.innerText = message;

  toast.classList.add("show");


  setTimeout(()=>{

    toast.classList.remove("show");

  },3000);

}