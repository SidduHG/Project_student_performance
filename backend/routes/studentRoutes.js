const express=require('express')
const router = express.Router();
const Student = require("../models/Student");
const Marks = require("../models/marks");
const multer = require("multer");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/checkStudent', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const student = await Student.findOne({ email: user.email });
    if (!student) return res.json({ exists: false });

    const marks = await Marks.findOne({ usn: student.usn });
    
    res.json({
      exists: true,
      student: student,
      marks: marks
    });

  } catch (err) {
    console.error('Check student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new student
router.post("/registerStudent", upload.single('profilePhoto'), async (req, res) => {
  try {
    const { fullName, usn, email, year, branch } = req.body;
    
    // Handle profile photo upload
    const profilePhoto = req.file 
      ? `/uploads/${req.file.filename}`
      : '/images/default-profile.jpg';

    // Check if student already exists
    const existingStudent = await Student.findOne({ usn });
    if (existingStudent) {
      const studentMarks = await Marks.findOne({ usn: existingStudent.usn });
      return res.status(200).json({
        exists: true,
        student: {
          usn: existingStudent.usn,
          fullName: existingStudent.fullName,
          email: existingStudent.email,
          year: existingStudent.year,
          branch: existingStudent.branch,
          profilePhoto: existingStudent.profilePhoto
        },
        marks: studentMarks || null,
        message: "Student already registered"
      });
    }

    // Create new student
    const newStudent = new Student({
      fullName,
      usn,
      email,
      year,
      branch,
      profilePhoto
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      student: {
        _id: newStudent._id,
        usn: newStudent.usn,
        fullName: newStudent.fullName,
        email: newStudent.email,
        year: newStudent.year,
        branch: newStudent.branch,
        profilePhoto: newStudent.profilePhoto
      },
      marks: null,
      message: "Registration successful",
      redirect: '/student-profile'
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Registration failed",
      error: error.message 
    });
  }
});


// Get student marks
router.get('/getStudentMarks/:usn', async (req, res) => {
  try {
    const { usn } = req.params;
    const marks = await Marks.findOne({ usn });
    
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found for this student' });
    }
    
    res.status(200).json(marks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;