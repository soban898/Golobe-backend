import jwt from "jsonwebtoken";
import User from "../models/User.js"; // make sure path is correct

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user; // attaches full user object to req.user
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid token." });
  }
};

export default authMiddleware;

