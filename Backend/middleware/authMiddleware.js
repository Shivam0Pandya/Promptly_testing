import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;
  // ----------------------------------------------------------------------
  // FIX 2: Check for the guaranteed lowercase 'authorization' header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Access the token from the lowercase header field
      token = req.headers.authorization.split(" ")[1]; 
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'TESTING_SECRET_KEY');
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("Error in protect middleware:", error);
      // This happens if the token exists but is invalid/expired
      return res.status(401).json({ message: "Not authorized, token failed" }); 
    }
  }

  // If the header wasn't present, the token is still undefined and this runs
  if (!token) return res.status(401).json({ message: "No token, not authorized" });
};

export { protect };