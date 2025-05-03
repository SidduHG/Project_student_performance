import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./StudentRegistration.css";

const StudentRegistration = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    usn: "",
    email: "",
    year: "",
    branch: "",
    profilePhoto: null,
  });
  const [previewURL, setPreviewURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRegistration = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const response = await fetch('http://localhost:3000/api/student/checkStudent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.exists) {
          localStorage.setItem('student', JSON.stringify(data.student));
          navigate('/student-profile');
        }
      } catch (err) {
        console.error('Registration check failed:', err);
      }
    };
    
    checkRegistration();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onload = (event) => setPreviewURL(event.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) form.append(key, value);
    });
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const res = await fetch("http://localhost:3000/api/student/registerStudent", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form,
      });
  
      const result = await res.json();
  
      if (res.ok) {
        localStorage.setItem("student", JSON.stringify(result.student));
        if (result.marks) {
          localStorage.setItem("studentMarks", JSON.stringify(result.marks));
        }
        navigate("/student-profile");
      } else {
        setError(result.message || "Failed to register student.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2 className="registration-title">Student Registration Form</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="usn">USN</label>
            <input
              type="text"
              id="usn"
              name="usn"
              required
              pattern="^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$"
              title="USN format: e.g., 1DS22IS157"
              value={formData.usn}
              onChange={handleChange}
              placeholder="Enter your USN"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              name="branch"
              required
              value={formData.branch}
              onChange={handleChange}
            >
              <option value="">Select Branch</option>
              <option value="ISE">Information Science and Engineering (ISE)</option>
              <option value="CSE">Computer Science and Engineering (CSE)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="ME">Mechanical Engineering (ME)</option>
              <option value="EE">Electrical Engineering (EE)</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="profilePhoto">Profile Photo</label>
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              required
              onChange={handleChange}
            />
            {previewURL && (
              <div className="photo-preview">
                <img
                  src={previewURL}
                  alt="Preview"
                  className="preview-image"
                />
                <small>Image Preview</small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span> Registering...</span>
                </>
              ) : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;