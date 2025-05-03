import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import './ViewResult.css'; 

const ViewResult = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const year = queryParams.get('year');
  const subject = queryParams.get('subject');

  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!year || !subject) {
          throw new Error('Year and Subject parameters are required');
        }

        const url = `http://localhost:3000/api/teacher/view-result?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(subject)}`;
        console.log('Fetching from:', url);

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add if using auth
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        setStudents(data.students || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || "Failed to fetch results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [year, subject]);

  return (
    <Container className="results-container">
      <div className="results-header">
        <h1 className="results-title">Results for Year {year}</h1>
        <h2 className="results-subtitle">Subject: {subject}</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" className="loading-spinner" />
          <p className="loading-text">Loading results...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="alert-message error-alert">
          {error}
        </Alert>
      ) : students.length === 0 ? (
        <Alert variant="info" className="alert-message info-alert">
          No results found for the selected criteria
        </Alert>
      ) : (
        <>
          <Table className="results-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>USN</th>
                <th>CIE 1</th>
                <th>CIE 2</th>
                <th>CIE 3</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.usn}>
                  <td>{student.fullName}</td>
                  <td>{student.usn}</td>
                  <td>{student.cie1?.obtained ?? '-'}</td>
                  <td>{student.cie2?.obtained ?? '-'}</td>
                  <td>{student.cie3?.obtained ?? '-'}</td>
                  <td>{student.totalMarks ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button className="back-button" href="/teacher">
            Back to Home
          </Button>
        </>
      )}
    </Container>
  );
};

export default ViewResult;