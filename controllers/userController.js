// controllers/userController.js
import crypto from "crypto";
import tempUserStore from "../utils/tempUserStore.js";
import transporter from "../config/nodemailer.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";


export const sendOtp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Temporarily hold user data
    tempUserStore[email] = {
      firstName,
      lastName,
      email,
      password,
      otp,
      otpExpires,
    };

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Golobe OTP Verification",
      text: `Your Golobe OTP is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = tempUserStore[email];

    if (!tempUser) {
      return res.status(404).json({ message: "No OTP found for this email or it expired" });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (tempUser.otpExpires < Date.now()) {
      delete tempUserStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    // Create user in DB now
    const user = await User.create({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true,
    });

    // Remove from temp store
    delete tempUserStore[email];

    // Send welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Golobe – Let the Journey Begin! ✈️",
      text: `Welcome to Golobe. Your account has been created with the email id: ${email}. A warm welcome to the Golobe family! 🌍.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User verified and registered successfully",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email first." });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    tempUserStore[email] = {
      otp,
      otpExpires,
      verified: false,
    };

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Golobe Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempData = tempUserStore[email];

    if (!tempData || tempData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (tempData.otpExpires < Date.now()) {
      delete tempUserStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark as verified
    tempUserStore[email].verified = true;

    res.status(200).json({ message: "OTP verified. You can now reset your password." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const tempData = tempUserStore[email];

    if (!tempData || !tempData.verified) {
      return res.status(400).json({ message: "OTP not verified for this email" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    delete tempUserStore[email]; // clean up

    res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
