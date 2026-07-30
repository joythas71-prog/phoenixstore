import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl =
"https://tvhgxlqqeklrdlgbkosa.supabase.co";

const supabaseKey =
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I";

const supabase =
createClient(supabaseUrl, supabaseKey);

// ================= CURRENT USER =================

let currentUser = null;

// ================= LOAD PROFILE =================

const { data: { session } } =
await supabase.auth.getSession();

if (!session) {
  window.location.href = "index.html";
}

currentUser = session.user;

const { data, error } =
await supabase
.from("profiles")
.select("*")
.eq("id", currentUser.id)
.single();

if (!error && data) {
  document.getElementById("username").value =
    data.username || "";

  document.getElementById("email").value =
    data.email || currentUser.email;

  if (data.avatar_url) {
    document.getElementById("profilePic").src =
      data.avatar_url;
  }
} else {
  document.getElementById("email").value =
    currentUser.email;
}

// ================= UPLOAD BUTTON =================

window.uploadImg = function () {
  document.getElementById("upload").click();
};

// ================= CLOUDINARY IMAGE UPLOAD =================

window.profileImageURL = "";

document.getElementById("upload").addEventListener("change", async function () {

  const file = this.files[0];
  if (!file) return;

  const btn = document.getElementById("uploadBtn");

  btn.innerText = "Uploading... ⏳";
  btn.disabled = true;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Phoenixstore_upload");

  try {

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/lhv0ojre/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (data.secure_url) {

      document.getElementById("profilePic").src = data.secure_url;

      window.profileImageURL = data.secure_url;

      btn.innerText = "Change Photo";
      btn.disabled = false;

      showToast("Photo Upload Success ✅");

    } else {

      alert("Cloudinary upload failed ❌");
      btn.innerText = "Change Photo";
      btn.disabled = false;

    }

  } catch (error) {

    console.error(error);

    alert("Photo Upload Failed ❌");

    btn.innerText = "Change Photo";
    btn.disabled = false;

  }

});

window.saveProfile = async function () {

  const name = document.getElementById("username").value.trim();

const img = window.profileImageURL;

if (!img) {
  alert("Please upload a profile photo first ❌");
  return;
}

  const { error } = await supabase
    .from("profiles")
    .update({
      username: name,
      avatar_url: img
    })
    .eq("id", currentUser.id);

  if (error) {
    alert(error.message);
    return;
  }

  showToast("Profile Saved Successfully ✅");

  setTimeout(() => {
    window.location.href = "home.html";
  }, 1000);

};

window.showToast = function (message) {

  const toast = document.getElementById("toast");

  toast.innerText = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);

};

window.logoutUser = async function () {

  await supabase.auth.signOut();

  localStorage.removeItem("userId");

  window.location.href = "index.html";

};

