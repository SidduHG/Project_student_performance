import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
 import './SelectSubject.css';

const SelectSubject = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [message, setMessage] = useState('');

  const subjectsByYear = {
    1: ["Mathematics", "Physics", "Chemistry", "English", "Python"],
    2: ["Data Structures", "DBMS", "Operating System", "Computer Networks"],
    3: ["Web Development", "Agile DevOps", "Cyber Security", "Software Testing"],
    4: ["Cloud Computing", "AI & ML", "Big Data", "Project Management"]
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedSubject(null);
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedYear || !selectedSubject) {
      setMessage("Please select both year and subject.");
      return;
    }

    // Navigate to EnterResult with state
    navigate('/teacher/enter-result', {
      state: {
        year: selectedYear,
        subject: selectedSubject
      }
    });
  };

  return (
    <div className="marks-entry-container bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container mt-5">
        <div className="card shadow">
          <div className="card-header bg-primary text-white text-center">
            <h2>Select Year for Marks Entry</h2>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-center mb-4">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  className={`btn m-2 ${selectedYear === year ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                  {year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                </button>
              ))}
            </div>

            {selectedYear && (
              <form onSubmit={handleSubmit}>
                <h4 className="text-center mb-3">Subjects for {selectedYear} Year</h4>
                <div className="d-flex flex-column align-items-start">
                  {subjectsByYear[selectedYear].map((subject) => (
                    <div key={subject} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subject"
                        value={subject}
                        id={subject}
                        onChange={() => setSelectedSubject(subject)}
                        checked={selectedSubject === subject}
                      />
                      <label className="form-check-label" htmlFor={subject}>
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-success">
                    Proceed
                  </button>
                </div>
                {message && (
                  <div className={`alert ${message.includes('Please') ? 'alert-warning' : 'alert-info'} mt-3 text-center`}>
                    {message}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
        <div className="text-center mt-4">
          <button onClick={() => navigate('/teacher')} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSubject;