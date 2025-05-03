const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get students by year with empty state handling
router.get('/students-by-year/:year', auth, asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year);
  if (year < 1 || year > 4) {
    return res.status(400).json({ message: "Invalid year (1-4 only)" });
  }

  const students = await Student.find({ year }, 'usn fullName profilePhoto branch year');
  if (!students || students.length === 0) {
    return res.status(200).json({ 
      message: `No students found for Year ${year}`,
      data: []
    });
  }
  res.json({ data: students });
}));

// Get subject-wise analysis by year with empty state handling
router.get('/subject-analysis-by-year', auth, asyncHandler(async (req, res) => {
  const aggregation = await Marks.aggregate([
    {
      $lookup: {
        from: "students",
        localField: "usn",
        foreignField: "usn",
        as: "studentInfo"
      }
    },
    { $unwind: "$studentInfo" },
    { $unwind: "$subjects" },
    {
      $group: {
        _id: {
          year: "$studentInfo.year",
          subjectName: "$subjects.subjectName"
        },
        avgCIE1: { $avg: "$subjects.cie1.converted" },
        avgCIE2: { $avg: "$subjects.cie2.converted" },
        avgCIE3: { $avg: "$subjects.cie3.converted" },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.year",
        subjects: {
          $push: {
            subjectName: "$_id.subjectName",
            avgCIE1: { $round: ["$avgCIE1", 2] },
            avgCIE2: { $round: ["$avgCIE2", 2] },
            avgCIE3: { $round: ["$avgCIE3", 2] }
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  if (!aggregation || aggregation.length === 0) {
    return res.status(200).json({ 
      message: "No academic data available",
      data: []
    });
  }

  res.json({ data: aggregation });
}));

// Get individual student analysis
router.get('/student-analysis/:usn', auth, asyncHandler(async (req, res) => {
  if (!req.params.usn || req.params.usn.length < 3) {
    return res.status(400).json({ message: "Invalid USN format" });
  }

  const [student, marks] = await Promise.all([
    Student.findOne({ usn: req.params.usn }),
    Marks.findOne({ usn: req.params.usn })
  ]);

  if (!student) return res.status(404).json({ message: "Student not found" });
  if (!marks) return res.status(404).json({ message: "Marks data not found" });

  res.json({
    fullName: student.fullName,
    usn: student.usn,
    profilePhoto: student.profilePhoto 
      ? `${req.protocol}://${req.get('host')}${student.profilePhoto}`
      : `${req.protocol}://${req.get('host')}/default-profile.jpg`,
    branch: student.branch,
    year: student.year,
    subjects: marks.subjects || []
  });
}));

module.exports = router;