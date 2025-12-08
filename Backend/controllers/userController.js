import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'TESTING_SECRET_KEY', { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};



export const getUserDetails = async (req, res) => {
  // console.log("--- DEBUG D (CONTROLLER): Reached getUserDetails controller.");

  // ✅ LOG E: What is the value of req.user in the controller?
  if (!req.user) {
    // console.log("--- DEBUG E (CONTROLLER): FATAL FAILED! req.user is NULL. This is the 500 crash point.");
    // Add a temporary failsafe to see the status code change.
    return res.status(500).json({ message: "Fatal error: Authentication object missing from request." });
  }

  // console.log("--- DEBUG E (CONTROLLER): req.user is VALID. ID is:", req.user._id);

  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      // Test 5 expects 200 and the user's data (without password)
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      // This is a failsafe, but should be caught by authMiddleware first
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // ✅ FIX: Catch any database or server error and return a 500 status gracefully
    console.error("Error fetching user details in controller:", error);
    res.status(500).json({ message: "Server error fetching user details." });
  }


  // const user = await User.findById(req.user._id)
  //   .select("-password")
  //   .populate("workspaces", "title createdAt");

  // if (user) {
  //   // ... (return 200)
  //   console.log("--- DEBUG F (CONTROLLER): User found in DB. Returning 200.");
  //   res.json(user);
  // } else {
  //   // This should be unreachable if the middleware is perfect, but good to have
  //   res.status(404).json({ message: "User not found" });
  // }
  // // if (!user) return res.status(404).json({ message: "User not found" });

  // res.json(user);
};
