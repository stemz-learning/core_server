const express = require("express");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/", courseController.getAllCourses);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);
router.get("/:id", courseController.getCourse);

modules.exports = router;