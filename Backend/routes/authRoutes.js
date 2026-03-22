const express = require("express");
const router = express.Router();

const { registerUser,loginUser } = require("../controllers/authcontroller");

router.post("/register", registerUser);

module.exports = router;
router.post("/login", loginUser);