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

    // Check user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (!profile) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: "Email not found"
        })
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Delete old OTP
    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email);

    // Save new OTP
    await supabase
      .from("otp_codes")
      .insert([
        {
          email,
          otp: otp.toString()
        }
      ]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Phoenix Store Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Password Reset Verification Code",
      html: `
      <h2>Password Reset</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 2 minutes.</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      })
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };

  }

};