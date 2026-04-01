const jwt = require("jsonwebtoken");

// 🔐 Protect Route Middleware
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // ❌ Token missing after split
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, invalid token format",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    // 🔥 Better error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please login again",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// 🔥 Role-Based Authorization Middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // ❌ No user attached
      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized, user missing",
        });
      }

      // ❌ Role not allowed
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Required role: ${roles.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("AUTHORIZATION ERROR:", error.message);
      return res.status(500).json({
        message: "Authorization error",
      });
    }
  };
};