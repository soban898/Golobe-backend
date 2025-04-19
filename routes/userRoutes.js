// routes/userRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import {
  sendOtp,
  verifyOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} from "../controllers/userController.js";

const router = express.Router();

// Auth and Register Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// router.post("/send-verify-otp", sendVerifyOtp);
// router.post("/verify-otp", verifyOtp);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in /me:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update user details
router.put("/me", authMiddleware, async (req, res) => {
  const { firstName, lastName, phoneNumber, address, dob, profilePic, coverPic } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.profilePic = profilePic || user.profilePic;
    user.coverPic = coverPic || user.coverPic;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;

