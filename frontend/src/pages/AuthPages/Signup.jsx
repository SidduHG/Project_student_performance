import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Signup.css'

const Signup=()=>{
    const navigate = useNavigate();
    const [formData,setFormData]=useState({
        fullName:"",
        email:"",
        password:"",
        role:""
    });

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormData(prev =>({
            ...prev,
            [name]:value
        }))
    }

    const handleSubmit=async (e)=>{
        e.preventDefault();
       try{
        const response=await fetch("http://localhost:3000/api/auth/signup",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formData)
        });

        const result=await response.json();

        if(response.ok){
            navigate("/login");
        }else{
            console.error("Signup failed",result.message);
        }
       }catch(error){
        console.log(error);
       }
    };

    return (
        <div className="center-container">
            <div className="form-container">
                <h2 className="text-center mb-4">Sign Up</h2>
                <form  className="signup-form"  onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="fullName" className="form-label">Full Name</label>
                        <input 
                        type="text"
                        id="fullname"
                        name="fullName" 
                        className="form-control"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="form-label">Email</label>
                        <input 
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={handleChange}
                         />
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                        type="password" 
                        id="password"
                        name="password"
                        className="form-control"
                        required
                        minLength="6"
                        value={formData.password}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="role-selection">
                        <div className="form-check">
                            <input 
                            type="radio"
                            id="teacherRadio"
                            name="role"
                            value="teacher"
                            checked={formData.role==="teacher"}
                            onChange={handleChange}
                             />
                        <label htmlFor="teacherRadio" className="form-check-label">Teacher</label>
                        </div>
                        
                        <div className="form-check">
                            <input 
                            type="radio"
                            id="studentRadio"
                            name="role"
                            value="student"
                            checked={formData.role==="student"}
                            onChange={handleChange}
                             />
                             <label htmlFor="studentRadio" className="form-check-label">Student</label>
                        </div>
                    </div>
                    <button type="submit" className="btn-submit">Submit</button>
                </form>
            </div>
        </div>
    )
}
export default Signup;