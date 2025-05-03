const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    subjects: [{
        subjectName: String,
        cie1: {
          obtained: Number,
          converted: Number,
          submitted: Boolean
        },
        cie2: {
          obtained: Number,
          converted: Number
        },
        cie3: {
          obtained: Number,
          converted: Number
        },
        totalMarks: Number
    }]
});

const Marks = mongoose.models.Marks || mongoose.model('Marks', MarksSchema);

module.exports = Marks;
