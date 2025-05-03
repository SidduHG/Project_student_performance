import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/AuthPages/Login";
import Signup from "./pages/AuthPages/Signup";
import Logout from "./pages/AuthPages/Logout";
import TeacherPage from "./pages/TeacherPages/TeacherPage";

import EnterResult from "./pages/TeacherPages/EnterResult/EnterResult";
import SelectSubject from "./pages/TeacherPages/EnterResult/SelectSubject";
import SelectSubjectForView from "./pages/TeacherPages/ViewResults/SelectSubjectForView";
import ViewResult from "./pages/TeacherPages/ViewResults/ViewResult";
import HomePage from "./pages/HomePage/HomePage"; 
import StudentRegistration from "./pages/StudentPages/StudentRegistration";
import StudentProfile from "./pages/StudentPages/StudentProfile";
import ResultAnalysis from "./pages/TeacherPages/ResultAnalysis/ResultAnalysis";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Root route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/teacher/enter-result" element={<EnterResult />} />
        <Route path="/teacher/select-subject" element={<SelectSubject />} />
        <Route path="/teacher/select-subject-for-view" element={<SelectSubjectForView />} />
        <Route path="/teacher/view-result" element={<ViewResult />} />
        <Route path="/teacher/result-analysis" element={<ResultAnalysis />} /> 
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        


      </Routes>
    </Router>
  );
}

export default App;
