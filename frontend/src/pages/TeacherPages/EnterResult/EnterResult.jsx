import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EnterResult.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EnterResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { year: selectedYear, subject: selectedSubject } = location.state || {};
  
  const [state, setState] = useState({
    popup: { show: false, message: "", isError: false },
    marksData: {},
    students: [],
    isLoading: false,
    hasChanges: false
  });

  useEffect(() => {
    if (!selectedSubject) {
      navigate("/teacher/select-subject");
      return;
    }

    const controller = new AbortController();

    const fetchStudents = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/teacher/registered-students?subject=${
            encodeURIComponent(selectedSubject)}&year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch students");
        }

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid student data format");

        const initialMarks = data.reduce((acc, student) => ({
          ...acc,
          [student.usn]: {
            cie1: parseMarks(student, 'cie1'),
            cie2: parseMarks(student, 'cie2'),
            cie3: parseMarks(student, 'cie3'),
            total: calculateTotalMarks(student)
          }
        }), {});

        setState(prev => ({
          ...prev,
          students: data,
          marksData: initialMarks,
          isLoading: false
        }));

      } catch (err) {
        if (err.name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            popup: { show: true, message: err.message, isError: true }
          }));
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              popup: { ...prev.popup, show: false }
            }));
          }, 3000);
        }
      }
    };

    fetchStudents();
    return () => controller.abort();
  }, [selectedSubject, selectedYear, navigate]);

const parseMarks = (student, cieKey) => {
  const subjectData = student.subjects?.find(sub => sub.subjectName === selectedSubject);
  return {
    obtained: subjectData?.[cieKey]?.obtained?.toString() || "",
    converted: (subjectData?.[cieKey]?.converted || 0).toFixed(2),
    submitted: !!subjectData?.[cieKey]?.submitted
  };
};

  const calculateTotalMarks = (student) => {
    const [cie1, cie2, cie3] = [1, 2, 3].map(n => 
      parseFloat(student[`cie${n}`]?.converted) || 0
    );
    return ((cie1 + cie2 + cie3) / 3).toFixed(2);
  };

  const handleInput = (usn, cieNumber, value) => {
    const numericValue = Math.min(50, Math.max(0, parseFloat(value) || 0));
    const cieKey = `cie${cieNumber}`;
    const converted = ((numericValue / 50) * 30).toFixed(2);

    setState(prev => {
      const studentMarks = prev.marksData[usn] || {};
      return {
        ...prev,
        marksData: {
          ...prev.marksData,
          [usn]: {
            ...studentMarks,
            [cieKey]: {
              obtained: numericValue.toString(),
              converted,
              submitted: false
            },
            total: calculateNewTotal(studentMarks, cieKey, converted)
          }
        },
        hasChanges: true
      };
    });
  };

  const calculateNewTotal = (existingMarks, updatedCieKey, newConverted) => {
    const cieValues = [1, 2, 3].map(num => 
      num === parseInt(updatedCieKey.slice(-1), 10)
        ? parseFloat(newConverted)
        : parseFloat(existingMarks[`cie${num}`]?.converted) || 0
    );
    return (cieValues.reduce((a, b) => a + b, 0) / 3).toFixed(2);
  };

  const submitMarks = async (usn, cieKey) => {
    try {
      const token = localStorage.getItem("token");
      const student = state.students.find(s => s.usn === usn);
      const cieData = state.marksData[usn]?.[cieKey];

      if (!student || !cieData) throw new Error("Student data not found");

      const response = await fetch(`http://localhost:3000/api/teacher/submit-single-cie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: student.fullName,
          usn,
          year: selectedYear,
          subjectName: selectedSubject,
          cieNumber: cieKey,
          obtained: parseFloat(cieData.obtained),
          converted: parseFloat(cieData.converted)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      setState(prev => ({
        ...prev,
        marksData: {
          ...prev.marksData,
          [usn]: {
            ...prev.marksData[usn],
            [cieKey]: { ...prev.marksData[usn][cieKey], submitted: true }
          }
        },
        hasChanges: false,
        popup: { show: true, message: "Marks submitted successfully", isError: false }
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        popup: { show: true, message: err.message, isError: true }
      }));
    } finally {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          popup: { ...prev.popup, show: false }
        }));
      }, 3000);
    }
  };

  const exportData = (type) => {
    const { students, marksData } = state;
    const rows = students.map(student => ({
      Name: student.fullName,
      USN: student.usn,
      ...['cie1', 'cie2', 'cie3'].reduce((acc, cie) => ({
        ...acc,
        [`${cie} Obtained`]: marksData[student.usn]?.[cie]?.obtained || '0',
        [`${cie} /30`]: marksData[student.usn]?.[cie]?.converted || '0.00'
      }), {}),
      "Total Marks": marksData[student.usn]?.total || '0.00'
    }));

    if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");
      XLSX.writeFile(workbook, `${selectedSubject}_Marks.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text(`Results for ${selectedSubject}`, 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [["Name", "USN", "CIE1 Obt", "CIE1 /30", "CIE2 Obt", "CIE2 /30", "CIE3 Obt", "CIE3 /30", "Total"]],
        body: rows.map(row => [
          row.Name,
          row.USN,
          row['cie1 Obtained'],
          row['cie1 /30'],
          row['cie2 Obtained'],
          row['cie2 /30'],
          row['cie3 Obtained'],
          row['cie3 /30'],
          row["Total Marks"]
        ])
      });
      doc.save(`${selectedSubject}_Marks.pdf`);
    }
  };

  if (!selectedSubject) return null;

  return (
    <div className="container-fluid p-3">
      <h1 className="text-center mb-3 fs-3">
        Enter Results for {selectedYear ? `${selectedYear} Year` : "2023-24"}
      </h1>
      <h2 className="text-center mb-4 fs-5">Subject: {selectedSubject}</h2>

      {state.isLoading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered text-center table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>USN</th>
                  {[1, 2, 3].map(i => (
                    <React.Fragment key={`header-${i}`}>
                      <th>CIE{i} Max</th>
                      <th>CIE{i} Obtained</th>
                      <th>CIE{i} /30</th>
                      <th>Submit CIE{i}</th>
                    </React.Fragment>
                  ))}
                  <th>Total (Avg)</th>
                </tr>
              </thead>
              <tbody>
                {state.students.map(student => (
                  <tr key={student.usn}>
                    <td>{student.fullName}</td>
                    <td>{student.usn}</td>
                    {[1, 2, 3].map(i => {
                      const cieKey = `cie${i}`;
                      const marks = state.marksData[student.usn]?.[cieKey] || {};
                      return (
                        <React.Fragment key={i}>
                          <td>
                            <input
                              type="number"
                              value="50"
                              readOnly
                              className="form-control form-control-sm"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder="Obtained"
                              className="form-control form-control-sm"
                              value={marks.obtained}
                              disabled={marks.submitted}
                              onChange={(e) => handleInput(student.usn, i, e.target.value)}
                              min="0"
                              max="50"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={marks.converted}
                              readOnly
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-success"
                              disabled={marks.submitted || !marks.obtained}
                              onClick={() => submitMarks(student.usn, cieKey)}
                            >
                              Submit
                            </button>
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={state.marksData[student.usn]?.total || "0.00"}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row justify-content-center mt-3 g-2">
            <div className="col-auto">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/teacher/select-subject")}
              >
                Change Subject
              </button>
            </div>
            <div className="col-auto">
              <button className="btn btn-secondary" onClick={() => navigate("/teacher")}>
                Back to Dashboard
              </button>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => exportData('excel')}
              >
                Download Excel
              </button>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-outline-danger" 
                onClick={() => exportData('pdf')}
              >
                Download PDF
              </button>
            </div>
          </div>
        </>
      )}

      {state.popup.show && (
        <div
          className={`position-fixed top-50 start-50 translate-middle p-3 rounded shadow ${
            state.popup.isError ? "bg-danger" : "bg-success"
          } text-white`}
          style={{ zIndex: 1000 }}
        >
          {state.popup.message}
        </div>
      )}
    </div>
  );
};

export default EnterResult;