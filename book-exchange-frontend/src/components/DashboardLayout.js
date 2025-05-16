import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="logo-section">
          📚 <span className="dashboard-logo">Nearbook</span>
        </div>
        <nav className="nav-links">
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/browse">Browse</Link>
        <Link to="/dashboard/my-books">My Books</Link>
        <Link to="/dashboard/exchanges">Exchanges</Link>
        <Link to="/dashboard/profile">Profile</Link>
          <button onClick={logout} className="logout-button">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayout;
