import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  profilePic: { type: String, default: "https://res.cloudinary.com/duhgfqdgt/image/upload/v1744961367/wqqmz0xuig9ivrtwntnx.png" }, // Cloudinary URL
  coverPic: { type: String, default: "https://res.cloudinary.com/duhgfqdgt/image/upload/v1744961406/caqpfqdlnawqeemsoxti.png" },   // Cloudinary URL
  phoneNumber: { type: String, default: "" },
  address: { type: String, default: "" },

  // ✅ Email Verification
  isVerified: { type: Boolean, default: false },

  // 🔐 OTP Fields
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
