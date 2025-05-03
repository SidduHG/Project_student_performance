import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import './StudentProfile.css';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageStatus, setImageStatus] = useState('loading');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const fetchStudentData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const response = await fetch('http://localhost:3000/api/student/checkStudent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch student data');
      
      const data = await response.json();
      if (!data.exists) return navigate('/student-registration');

      setStudent(data.student);
      setMarks(data.marks || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const getProfileImageUrl = () => {
    if (!student?.profilePhoto) return '/uploads/default-profile.png';
    if (student.profilePhoto.startsWith('http')) return student.profilePhoto;
    return `http://localhost:3000${student.profilePhoto}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="student-profile-container container py-4">
      <div className="card shadow-sm">
        <div className="d-flex justify-content-between align-items-center p-3">
          <h2>Student Profile</h2>
          
          <Dropdown>
            <Dropdown.Toggle 
              variant="light" 
              id="dropdown-menu" 
              className="border-0 rounded-circle p-2"
            >
              <i className="bi bi-list"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-end">
            <Dropdown.Item 
               onClick={() => navigate('/student-registration', { state: { studentData: student } })}
            >
              <i className="bi bi-pencil-square text-primary me-2"></i> Update Profile
            </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => setShowResults(!showResults)}
              >
                <i className="bi bi-file-earmark-bar-graph text-success me-2"></i> 
                {showResults ? 'Hide Results' : 'View Results'}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={handleLogout} 
                className="text-danger"
              >
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="text-center">
          <img
            src={getProfileImageUrl()}
            alt="Profile"
            className="rounded-circle"
            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            onLoad={() => setImageStatus('loaded')}
            onError={() => setImageStatus('error')}
          />
          {imageStatus === 'error' && (
            <div className="text-muted">Image not available</div>
          )}
        </div>

        <ul className="list-group list-group-flush mt-3">
          <li className="list-group-item"><strong>Full Name:</strong> {student.fullName}</li>
          <li className="list-group-item"><strong>USN:</strong> {student.usn}</li>
          <li className="list-group-item"><strong>Email:</strong> {student.email}</li>
          <li className="list-group-item"><strong>Year:</strong> {student.year}</li>
          <li className="list-group-item"><strong>Branch:</strong> {student.branch}</li>
        </ul>

        {showResults && (
          <div className="p-3">
            <h5>Academic Performance</h5>
            {marks && marks.subjects?.length > 0 ? (
              <table className="table table-bordered mt-2">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CIE 1</th>
                    <th>CIE 2</th>
                    <th>CIE 3</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td>{subject.subjectName}</td>
                      <td>{subject.cie1?.obtained ?? '-'}</td>
                      <td>{subject.cie2?.obtained ?? '-'}</td>
                      <td>{subject.cie3?.obtained ?? '-'}</td>
                      <td>
                        {subject.totalMarks?.toFixed(2) || 
                        ((subject.cie1?.converted || 0) + 
                         (subject.cie2?.converted || 0) + 
                         (subject.cie3?.converted || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="alert alert-info mt-2">No marks data available yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;