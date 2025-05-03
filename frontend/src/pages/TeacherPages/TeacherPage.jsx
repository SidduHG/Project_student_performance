import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import './TeacherPage.css';

const TeacherPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        navigate('/signup');
        return;
      }
  
      try {
        const res = await fetch('http://localhost:3000/api/auth/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // send token in header
          },
        });
  
        if (!res.ok) {
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/signup');
          return;
        }
  
        const data = await res.json();
        setUser(data.user); // assuming backend sends user object
      } catch (err) {
        console.error("Token validation failed", err);
        navigate('/signup');
      }
    };
  
    checkAuth();
  }, [navigate]);
  
  return (
    <div className="teacher-dashboard" style={{
      backgroundImage: "url('https://img.freepik.com/free-vector/graduation-hats-frame_53876-91596.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      margin: 0
    }}>
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img 
              src="https://d30mzt1bxg5llt.cloudfront.net/public/uploads/images/_signatoryLogo/DSI-Logo.jpg" 
              alt="School Logo" 
              className="navbar-logo"
            />
            Student Marks Analysis
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Reports</a>
              </li>
              <li className="nav-item">
                <a className="btn btn-outline-success" href="/logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="dashboard">
        <h1>Welcome, {user?.fullName || "Teacher"}!</h1>
        <div className="row">
          <div className="col-md-4 col-sm-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-pencil-alt"></i> Enter the Marks</h5>
                <p className="card-text">Enter the student marks using this.</p>
                <a href="/teacher/select-subject" className="btn btn-primary">Click here to enter</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-eye"></i> View Student Marks</h5>
                <p className="card-text">Access individual student performance.</p>
                <a href="/teacher/select-subject-for-view" className="btn btn-primary">Go to Marks</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-6 mx-auto">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-chart-bar"></i> Analyse Class Performance</h5>
                <p className="card-text">Manage student records and do analysis.</p>
                <a href="/teacher/result-analysis" className="btn btn-primary">Analyse</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
