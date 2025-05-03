// models/student.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const studentSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    usn: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        default: "/images/default-profile.jpg",
    },
}, { timestamps: true });

module.exports = mongoose.models.Student || model('Student', studentSchema);


