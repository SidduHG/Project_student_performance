const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Student = require('../models/Student');
const Marks = require('../models/Marks');

router.get('/teacher', verifyToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied: not a teacher' });
  }
  res.json({ message: 'Teacher-specific data', user: req.user });
});

// Subject selection
router.post('/select-subject', verifyToken, (req, res) => {
  const { year, subject } = req.body;
  if (!year || !subject) {
    return res.status(400).json({ message: "Year and subject are required." });
  }
  res.status(200).json({ message: "Subject selected successfully." });
});

//registered-students       
router.get('/registered-students', verifyToken, async (req, res) => {
  try {
    const { subject, year } = req.query;
    
    if (!subject || !year) {
      return res.status(400).json({ 
        message: "Subject and year are required" 
      });
    }

    // Corrected aggregation pipeline
    const students = await Student.aggregate([
      // Start with students in the selected year
      { $match: { year: parseInt(year) } },
      // Lookup marks data (if exists)
      {
        $lookup: {
          from: "marks",
          localField: "usn",
          foreignField: "usn",
          as: "marksData"
        }
      },
      // Unwind marksData (optional array)
      { $unwind: { path: "$marksData", preserveNullAndEmptyArrays: true } },
      // Filter students who either:
      // - Don't have marks for this subject at all
      // - Have marks but are missing any CIE entries
      {
        $match: {
          $or: [
            { 
              "marksData.subjects": { 
                $not: { 
                  $elemMatch: { subjectName: subject } 
                } 
              } 
            },
            { 
              "marksData.subjects": { 
                $elemMatch: { 
                  subjectName: subject,
                  $or: [
                    { "cie1.obtained": { $exists: false } },
                    { "cie2.obtained": { $exists: false } },
                    { "cie3.obtained": { $exists: false } }
                  ]
                } 
              } 
            }
          ]
        }
      },
      // Project only necessary fields
      {
        $project: {
          _id: 0,
          fullName: 1,
          usn: 1,
          year: 1,
          subjects: "$marksData.subjects"
        }
      }
    ]);

    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ 
      message: 'Failed to fetch students', 
      error: err.message 
    });
  }
});

// Submit marks for multiple students
router.post('/submit-marks', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Access denied" });
    }

    const { marksData } = req.body;
    if (!Array.isArray(marksData)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const bulkOps = [];
    const studentsToCheck = new Set();

    for (const data of marksData) {
      const existingMark = await Marks.findOne({
        usn: data.usn,
        year: data.year,
        "subjects.subjectName": data.subjectName
      });

      if (existingMark) continue;

      const markEntry = await Marks.findOne({ usn: data.usn, year: data.year });

      const subjectData = {
        subjectName: data.subjectName,
        cie1: {
          obtained: data.cie1?.obtained || 0,
          converted: ((data.cie1?.obtained || 0) / 50) * 30
        },
        cie2: {
          obtained: data.cie2?.obtained || 0,
          converted: ((data.cie2?.obtained || 0) / 50) * 30
        },
        cie3: {
          obtained: data.cie3?.obtained || 0,
          converted: ((data.cie3?.obtained || 0) / 50) * 30
        },
        totalMarks: data.totalMarks || 0
      };

      if (markEntry) {
        bulkOps.push({
          updateOne: {
            filter: { usn: data.usn, year: data.year },
            update: { $push: { subjects: subjectData } }
          }
        });
      } else {
        bulkOps.push({
          updateOne: {
            filter: { usn: data.usn, year: data.year },
            update: {
              $set: {
                fullName: data.fullName,
                usn: data.usn,
                year: data.year,
                subjects: [subjectData]
              }
            },
            upsert: true
          }
        });
      }

      studentsToCheck.add(data.usn);
    }

    if (bulkOps.length > 0) {
      await Marks.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: 'Marks submitted successfully' });
  } catch (err) {
    console.error('Error submitting marks:', err);
    res.status(500).json({ message: 'Failed to submit marks' });
  }
});

// Submit individual CIE
router.post("/submit-single-cie", verifyToken, async (req, res) => {
  try {
    const { usn, year, subjectName, cieNumber, obtained } = req.body;

    if (!usn || !subjectName || !cieNumber || obtained == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const converted = (obtained / 50) * 30;
    const marksDoc = await Marks.findOne({ usn, year });

    if (!marksDoc) {
      const newMarks = new Marks({
        fullName: req.body.fullName || "Unknown",
        usn,
        year,
        subjects: [{
          subjectName,
          [cieNumber]: {
            obtained,
            converted,
            submitted: true
          }
        }]
      });
      await newMarks.save();
      return res.status(200).json({ message: `${cieNumber.toUpperCase()} marks submitted for ${usn}` });
    }

    const subjectIndex = marksDoc.subjects.findIndex(sub => sub.subjectName === subjectName);
    
    if (subjectIndex === -1) {
      marksDoc.subjects.push({
        subjectName,
        [cieNumber]: {
          obtained,
          converted,
          submitted: true
        }
      });
    } else {
      marksDoc.subjects[subjectIndex][cieNumber] = {
        obtained,
        converted,
        submitted: true
      };
    }

    await marksDoc.save();
    res.status(200).json({ message: `${cieNumber.toUpperCase()} marks submitted for ${usn}` });
  } catch (error) {
    console.error("Submit single CIE error:", error);
    res.status(500).json({ message: "Server error while submitting marks" });
  }
});

// Check who already has marks for a subject
router.get('/check-marks', verifyToken, async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) return res.status(400).json({ message: "Subject is required" });

    const markedStudents = await Marks.find({
      "subjects.subjectName": subject
    }).select('usn fullName -_id');

    res.status(200).json(markedStudents);
  } catch (err) {
    console.error('Error checking marked students:', err);
    res.status(500).json({ message: 'Failed to check marked students' });
  }
});


router.get('/view-result', verifyToken, async (req, res) => {
  try {
    const { subject, year } = req.query;
    
    if (!subject || !year) {
      return res.status(400).json({ 
        error: "Both subject and year parameters are required",
        students: [] 
      });
    }

    // Parse year to a number
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear)) {
      return res.status(400).json({ 
        error: "Invalid year parameter",
        students: [] 
      });
    }

    const results = await Marks.find({
      year: parsedYear, // Use parsed number
      "subjects.subjectName": subject.trim()
    }).lean();

    console.log(`Found ${results.length} records for ${subject}, ${year}`);

    if (!results || results.length === 0) {
      return res.status(404).json({ 
        error: "No results found",
        students: [] 
      });
    }

    const formattedResults = results.map(student => {
      const subjectData = student.subjects.find(sub => 
        sub.subjectName === subject.trim()
      ) || {};

      return {
        fullName: student.fullName,
        usn: student.usn,
        cie1: subjectData.cie1 || { obtained: null },
        cie2: subjectData.cie2 || { obtained: null },
        cie3: subjectData.cie3 || { obtained: null },
        totalMarks: subjectData.totalMarks || null
      };
    });

    res.json({ students: formattedResults });

  } catch (error) {
    console.error("ViewResult error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      students: [] 
    });
  }
});

// In your teacherRoutes.js

// Class performance analysis
router.get('/result-analysis', verifyToken, async (req, res) => {
  try {
    const { subject, year } = req.query;
    
    // Aggregate class performance data
    const result = await Marks.aggregate([
      { $match: { year: parseInt(year), 'subjects.subjectName': subject } },
      { $unwind: '$subjects' },
      { $match: { 'subjects.subjectName': subject } },
      {
        $group: {
          _id: null,
          averageCie1: { $avg: '$subjects.cie1.converted' },
          averageCie2: { $avg: '$subjects.cie2.converted' },
          averageCie3: { $avg: '$subjects.cie3.converted' },
          averageFinal: { $avg: '$subjects.totalMarks' },
          highestCie1: { $max: '$subjects.cie1.converted' },
          highestCie2: { $max: '$subjects.cie2.converted' },
          highestCie3: { $max: '$subjects.cie3.converted' },
          highestFinal: { $max: '$subjects.totalMarks' },
          lowestCie1: { $min: '$subjects.cie1.converted' },
          lowestCie2: { $min: '$subjects.cie2.converted' },
          lowestCie3: { $min: '$subjects.cie3.converted' },
          lowestFinal: { $min: '$subjects.totalMarks' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averageCie1: 1,
          averageCie2: 1,
          averageCie3: 1,
          averageFinal: 1,
          highestCie1: 1,
          highestCie2: 1,
          highestCie3: 1,
          highestFinal: 1,
          lowestCie1: 1,
          lowestCie2: 1,
          lowestCie3: 1,
          lowestFinal: 1,
          passPercentageCie1: {
            $multiply: [
              {
                $divide: [
                  {
                    $size: {
                      $filter: {
                        input: '$subjects',
                        as: 'subj',
                        cond: { $gte: ['$$subj.cie1.converted', 15] }
                      }
                    }
                  },
                  '$count'
                ]
              },
              100
            ]
          },
          // Similar for CIE2, CIE3, and Final
          topPerformersCount: {
            $size: {
              $filter: {
                input: '$subjects',
                as: 'subj',
                cond: { $gte: ['$$subj.totalMarks', 24] }
              }
            }
          },
          averagePerformersCount: {
            $size: {
              $filter: {
                input: '$subjects',
                as: 'subj',
                cond: {
                  $and: [
                    { $gte: ['$$subj.totalMarks', 15] },
                    { $lt: ['$$subj.totalMarks', 24] }
                  ]
                }
              }
            }
          },
          weakPerformersCount: {
            $size: {
              $filter: {
                input: '$subjects',
                as: 'subj',
                cond: { $lt: ['$$subj.totalMarks', 15] }
              }
            }
          }
        }
      }
    ]);

    res.json(result[0] || {});
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

// Individual student performance
router.get('/individual-performance', verifyToken, async (req, res) => {
  try {
    const { subject, year } = req.query;
    
    const students = await Marks.aggregate([
      { $match: { year: parseInt(year), 'subjects.subjectName': subject } },
      { $unwind: '$subjects' },
      { $match: { 'subjects.subjectName': subject } },
      {
        $project: {
          _id: 0,
          fullName: 1,
          usn: 1,
          cie1: '$subjects.cie1.converted',
          cie2: '$subjects.cie2.converted',
          cie3: '$subjects.cie3.converted',
          final: '$subjects.totalMarks',
          performance: {
            $cond: [
              { $gte: ['$subjects.totalMarks', 24] },
              'top',
              {
                $cond: [
                  { $gte: ['$subjects.totalMarks', 15] },
                  'average',
                  'weak'
                ]
              }
            ]
          }
        }
      },
      { $sort: { final: -1 } }
    ]);

    res.json(students);
  } catch (err) {
    console.error('Individual performance error:', err);
    res.status(500).json({ error: 'Failed to fetch individual performance' });
  }
});

module.exports = router;