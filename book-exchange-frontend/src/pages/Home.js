import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/me', {
          headers: { 'x-auth-token': token },
        });
        setUsername(res.data.username || 'User'); // Fallback to 'User' if username is missing
      } catch (err) {
        console.error('Error fetching user data:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [token, navigate]);

  return (
    <div className="home-container">
      <h1>Welcome back, {username || 'User'}! 👋</h1>
      <ul className="feature-list">
        <li>📘 View and manage your books</li>
        <li>🔁 Explore exchanges with other users</li>
        <li>🌍 Browse books available nearby</li>
        <li>✨ Keep your profile updated and awesome</li>      
        </ul>
      <p className="enjoy-msg">Enjoy your time on Nearbook! 🚀</p>
    </div>
  );
};

export default Home;