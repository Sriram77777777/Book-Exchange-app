import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Import the CSS file

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const { username, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', { username, email, password });
      localStorage.setItem('token', res.data.token); // Store token in localStorage
      console.log('Signed up successfully! Token:', res.data.token);
      navigate('/login'); // Redirect to login page after successful signup
    } catch (err) {
      console.error(err.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Sign Up</h2>
        <form onSubmit={onSubmit} className="signup-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Username"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Email"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;