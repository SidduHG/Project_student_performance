import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart, Bar, Tooltip, Legend, XAxis, YAxis,
  CartesianGrid, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";
import "./ResultAnalysis.css";

const ResultAnalysis = () => {
  const { usn } = useParams();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(usn ? "student" : "class");
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [emptyState, setEmptyState] = useState({
    yearlyData: false,
    students: false,
    studentData: false,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [yearlyRes] = await Promise.all([
        fetch("http://localhost:3000/api/analysis/subject-analysis-by-year", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      if (!yearlyRes.ok) throw new Error("Failed to fetch yearly analysis");

      const { data: yearlyAnalysis } = await yearlyRes.json();
      setYearlyData(yearlyAnalysis || []);
      setEmptyState(prev => ({ ...prev, yearlyData: !yearlyAnalysis?.length }));

      if (yearlyAnalysis?.length > 0) {
        setSelectedYear(yearlyAnalysis[0]._id);
        await fetchStudentsByYear(yearlyAnalysis[0]._id);
      }

      if (usn) {
        await fetchStudentPerformance(usn);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByYear = async (year) => {
    try {
      setLoading(true);
      setStudents([]);
      setSelectedStudent(null);
      setSelectedYear(year);

      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/analysis/students-by-year/${year}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch students");

      const { data } = await res.json();
      setStudents(data || []);
      setEmptyState(prev => ({ ...prev, students: !data?.length }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentPerformance = async (usn) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3000/api/analysis/student-analysis/${usn}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch student data");

      const data = await res.json();
      setSelectedStudent(data);
      setEmptyState(prev => ({ ...prev, studentData: !data }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderNoDataMessage = (title, description = "No academic data available.") => (
    <div className="no-data-container">
      <div className="no-data-icon">📊</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  const renderYearTabs = () => (
    <div className="year-tabs">
      {[1, 2, 3, 4].map(year => (
        <button
          key={year}
          className={`year-tab ${selectedYear === year ? 'active' : ''}`}
          onClick={() => fetchStudentsByYear(year)}
        >
          Year {year}
        </button>
      ))}
    </div>
  );

  const renderYearAnalysis = () => {
    if (emptyState.yearlyData) return renderNoDataMessage("No Yearly Data Available");

    const yearData = yearlyData.find(y => y._id === selectedYear)?.subjects || [];
    if (yearData.length === 0) return renderNoDataMessage(`No data for Year ${selectedYear}`);

    return (
      <div className="year-analysis">
        <h3>Year {selectedYear} Performance</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subjectName" />
              <YAxis domain={[0, 50]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgCIE1" fill="#8884d8" name="Avg CIE1" />
              <Bar dataKey="avgCIE2" fill="#82ca9d" name="Avg CIE2" />
              <Bar dataKey="avgCIE3" fill="#ffc658" name="Avg CIE3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const radarStudentData = selectedStudent?.subjects?.map(sub => ({
    subject: sub.subjectName,
    CIE1: Number(sub.cie1?.converted || 0),
    CIE2: Number(sub.cie2?.converted || 0),
    CIE3: Number(sub.cie3?.converted || 0),
  })) || [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button onClick={fetchInitialData} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <div className="view-toggle-container">
        <button
          className={`toggle-button ${view === "class" ? "active" : ""}`}
          onClick={() => {
            setView("class");
            setSelectedStudent(null);
          }}
        >
          Class Analysis
        </button>
        <button
          className={`toggle-button ${view === "student" ? "active" : ""}`}
          onClick={() => {
            setView("student");
            if (selectedYear && students.length > 0) {
              fetchStudentPerformance(students[0].usn);
            }
          }}
        >
          Student Analysis
        </button>
      </div>

      {view === "class" ? (
        <>
          <h2 className="section-title">Class Performance Analysis</h2>
          {renderYearTabs()}
          {renderYearAnalysis()}
        </>
      ) : (
        <>
          <h2 className="section-title">Student Analysis</h2>
          {renderYearTabs()}

          <div className="student-select-container">
            {emptyState.students ? (
              renderNoDataMessage("No Students Found", `No students registered for Year ${selectedYear}`)
            ) : (
              <select
                className="student-select"
                onChange={(e) => {
                  if (e.target.value) {
                    fetchStudentPerformance(e.target.value);
                  } else {
                    setSelectedStudent(null);
                  }
                }}
                value={selectedStudent?.usn || ""}
              >
                <option value="" disabled>Select a student</option>
                {students.map(student => (
                  <option key={student._id} value={student.usn}>
                    {student.fullName} ({student.usn})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedStudent ? (
            <>
              <div className="student-info-container">
                <div className="student-photo-container">
                  <img
                    src={selectedStudent.profilePhoto}
                    alt={selectedStudent.fullName}
                    className="student-photo"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-profile.jpg'; }}
                  />
                </div>
                <div className="student-details">
                  <h2 className="student-name">{selectedStudent.fullName}</h2>
                  <p><strong>USN:</strong> {selectedStudent.usn}</p>
                  <p><strong>Branch:</strong> {selectedStudent.branch}</p>
                  <p><strong>Year:</strong> {selectedStudent.year}</p>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={selectedStudent.subjects}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subjectName" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cie1.converted" fill="#8884d8" name="CIE1 Marks" />
                    <Bar dataKey="cie2.converted" fill="#82ca9d" name="CIE2 Marks" />
                    <Bar dataKey="cie3.converted" fill="#ffc658" name="CIE3 Marks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart outerRadius="80%" data={radarStudentData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 50]} />
                    <Radar name="CIE1" dataKey="CIE1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="CIE2" dataKey="CIE2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="CIE3" dataKey="CIE3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            !emptyState.students && renderNoDataMessage("No Student Selected")
          )}
        </>
      )}
    </div>
  );
};

export default ResultAnalysis;