const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require("./routes/studentRoutes");
const analysisRoutes = require('./routes/analysis');

const app = express();

// server.js or app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // good
app.use('/public', express.static(path.join(__dirname, 'public')));   // for default image if needed


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/CollegeDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // frontend Vite server
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/analysis', analysisRoutes);

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
