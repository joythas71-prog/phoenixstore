const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Email is required"
        })
      };
    }

const otp = Math.floor(100000 + Math.random() * 900000);


// Delete old OTP
const { error: deleteError } = await supabase
  .from("otp_codes")
  .delete()
  .eq("email", email);

if (deleteError) {
  throw deleteError;
}


// Save new OTP
const { error } = await supabase
  .from("otp_codes")
  .insert([
    {
      email: email,
      otp: otp.toString()
    }
  ]);

if (error) {
  throw error;
}


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "OTP sent successfully"
      })
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};