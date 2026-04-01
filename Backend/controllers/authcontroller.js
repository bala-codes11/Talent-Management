const User = require("../models/user");
const jwt = require("jsonwebtoken");

// 🔥 Helper: Generate Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ==============================
// 📝 REGISTER USER
// ==============================
exports.registerUser = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;

    // 🔥 Normalize email
    email = email?.toLowerCase().trim();

    // 🚫 Block admin registration
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin cannot register. Please contact system admin.",
      });
    }

    // ✅ Validate fields
    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // ✅ Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role: "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    next(error); // 🔥 use global handler
  }
};

// ==============================
// 🔐 LOGIN USER
// ==============================
exports.loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // 🔥 Normalize email
    email = email?.toLowerCase().trim();

    // ✅ Validate input
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

 const user = await User.findOne({ email }).select("+password");

if (!user || !user.password) {
  return res.status(400).json({
    message: "Invalid email or password",
  });
}

const isMatch = await user.matchPassword(password);

if (!isMatch) {
  return res.status(400).json({
    message: "Invalid email or password",
  });
}

    // ✅ Generate token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    next(error); // 🔥 global handler
  }
};