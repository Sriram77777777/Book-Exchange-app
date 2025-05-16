import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Signup from './components/Signup';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import Profile from './pages/Profile';
import MyBooks from './pages/MyBooks';
import Exchanges from './pages/Exchanges';
import Browse from './pages/Browse';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="app-content">
          <Routes>
            {/* Landing Page Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Home />} /> {/* default page */}
              <Route path="profile" element={<Profile />} />
              <Route path="my-books" element={<MyBooks />} />
              <Route path="exchanges" element={<Exchanges />} />
              <Route path="browse" element={<Browse />} />
              
            </Route>

            {/* Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
