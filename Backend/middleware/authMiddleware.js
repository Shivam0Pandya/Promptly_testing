// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; 
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'TESTING_SECRET_KEY');
      req.user = await User.findById(decoded.id).select("-password");

      // ⭐ CRITICAL FIX: Handle the case where the user was deleted (e.g., by test cleanup)
      if (!req.user) {
        // Return 401 if the token is valid but the user doesn't exist
        return res.status(401).json({ message: "Not authorized, user no longer exists" });
      }

      next();
      return; // Ensure the function exits
    } catch (error) {
      console.error("Error in protect middleware:", error);
      // This happens if the token is malformed, invalid, or expired
      return res.status(401).json({ message: "Not authorized, token failed" }); 
    }
  }

  if (!token) return res.status(401).json({ message: "No token, not authorized" });
};

export { protect };