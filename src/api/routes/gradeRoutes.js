const express = require("express");
const gradeController = require("../controllers/gradeController");

const router = express.Router();

router.get("/", gradeController.getAllGrades);
router.get("/:id", gradeController.getGrade);
router.post("/", gradeController.createGrade);
router.put("/:id", gradeController.updateGrade);
router.delete("/:id", gradeController.deleteGrade);
router.get("/classroom/:classroomId", gradeController.getGradesByClassroom);
router.get("/classroom/:classroomId/course/:courseId", gradeController.getGradesByCourseInClassroom);

module.exports = router;