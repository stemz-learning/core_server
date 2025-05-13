// src/routes/userPointRoutes.js

const express = require("express");
const {
  getUserPoints,
  updateUserPoints,
  updateActivityProgress,
  resetUserPoints,
  getUserTotalPoints
} = require("../controllers/userPointController");

const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

// Use RESTful route conventions
router.get("/", authenticateToken, getUserPoints); // Get the authenticated user's points
router.post("/", authenticateToken, updateUserPoints); // Update the authenticated user's entire points data
router.patch("/activity", authenticateToken, updateActivityProgress); // Update specific activity progress
router.get("/total", authenticateToken, getUserTotalPoints); // Get authenticated user's total points
router.get("/total/:userId", authenticateToken, getUserTotalPoints); // Get any user's total points (with auth check)
router.delete("/reset/:userId", authenticateToken, resetUserPoints); // Reset a user's points (with admin check)

module.exports = router;