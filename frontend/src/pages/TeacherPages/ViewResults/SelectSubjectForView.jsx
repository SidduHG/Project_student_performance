import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Alert,
  Spinner
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SelectSubjectForView.css'; // Create this CSS file for custom styles

const SelectSubjectForView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAnalysis = queryParams.get('purpose') === 'analysis';

  // Define subjects by year (could be fetched from API in real implementation)
  const subjectsByYear = {
    "1": ["Mathematics", "Physics", "Chemistry", "English", "Python"],
    "2": ["Data Structures", "DBMS", "Operating System", "Computer Networks"],
    "3": ["Web Development", "Agile DevOps", "Cyber Security", "Software Testing"],
    "4": ["Cloud Computing", "AI & ML", "Big Data", "Project Management"]
  };

  // State management
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine the target route based on navigation purpose
  const getTargetRoute = () => {
    return isAnalysis 
      ? '/teacher/result-analysis' 
      : '/teacher/view-result';
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedSubject('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      setError("Please select a subject before proceeding.");
      return;
    }

    try {
      setLoading(true);
      // Here you could add validation or API calls if needed
      // before navigating
      
      navigate(`${getTargetRoute()}?year=${selectedYear}&subject=${selectedSubject}`);
    } catch (err) {
      setError("Failed to proceed. Please try again.");
      console.error("Navigation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear error when year or subject changes
  useEffect(() => {
    setError(null);
  }, [selectedYear, selectedSubject]);

  return (
    <div className="subject-selection-container">
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <Card className="shadow-lg">
          <Card.Header className="bg-primary text-white">
            <Card.Title className="text-center">
              {isAnalysis ? 'Select for Analysis' : 'Select for Viewing Results'}
            </Card.Title>
          </Card.Header>
          
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <h5 className="text-center mb-4">Select Academic Year</h5>
            <div className="d-flex flex-wrap justify-content-center mb-4">
              {[1, 2, 3, 4].map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year.toString() ? "primary" : "outline-primary"}
                  className="m-2 year-button"
                  onClick={() => handleYearSelect(year.toString())}
                >
                  {year} {year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                </Button>
              ))}
            </div>

            {selectedYear && (
              <div className="subject-selection-section">
                <h5 className="text-center mb-3">
                  Subjects for {selectedYear}
                  {selectedYear === '1' ? 'st' : selectedYear === '2' ? 'nd' : selectedYear === '3' ? 'rd' : 'th'} Year
                </h5>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    {subjectsByYear[selectedYear].map(subject => (
                      <Form.Check
                        key={subject}
                        type="radio"
                        id={`subject-${subject}`}
                        name="subject"
                        label={subject}
                        checked={selectedSubject === subject}
                        onChange={() => setSelectedSubject(subject)}
                        className="py-2 subject-option"
                      />
                    ))}
                  </Form.Group>

                  <div className="text-center">
                    <Button 
                      variant="success" 
                      type="submit"
                      disabled={!selectedSubject || loading}
                      className="submit-button"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span className="ms-2">Processing...</span>
                        </>
                      ) : (
                        'Proceed'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </Card.Body>

          <Card.Footer className="text-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/teacher')}
              size="sm"
            >
              Back to Dashboard
            </Button>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default SelectSubjectForView;