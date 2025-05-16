import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bookCount, setBookCount] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, booksRes, exchangesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/me', {
            headers: { 'x-auth-token': token },
          }),
          axios.get('http://localhost:5000/api/books/my-books', {
            headers: { 'x-auth-token': token },
          }),
          axios.get('http://localhost:5000/api/books/my-requests', {
            headers: { 'x-auth-token': token },
          }),
        ]);
        console.log('Fetched user data:', userRes.data); // Debug log
        setUser(userRes.data);
        setBio(userRes.data.bio || '');
        setContactInfo(userRes.data.contactInfo || '');
        setBookCount(booksRes.data.length);
        setExchangeCount(exchangesRes.data.filter(e => e.status === 'accepted').length);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', bio || ''); // Ensure bio is always sent
    formData.append('contactInfo', contactInfo || ''); // Ensure contactInfo is always sent
    if (avatar) {
      console.log('Uploading avatar:', avatar.name, 'size:', avatar.size, 'type:', avatar.type);
      formData.append('avatar', avatar);
    } else {
      console.log('No avatar selected for upload');
    }

    // Debug FormData content
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1].name || pair[1]}`);
    }

    try {
      const res = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update response:', res.data); // Debug log
      setUser(prevUser => ({
        ...prevUser,
        bio: res.data.user.bio || '',
        contactInfo: res.data.user.contactInfo || '',
        avatar: res.data.user.avatar,
      }));
      setBio(res.data.user.bio || '');
      setContactInfo(res.data.user.contactInfo || '');
      setAvatar(null);
      setMessage(res.data.msg);
      setEditMode(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getBadges = () => {
    const badges = [];

    // Book-related badges
    if (bookCount >= 1) badges.push('📖 Book Starter (1+ Books)');
    if (bookCount >= 5) badges.push('📚 Book Collector (5+ Books)');
    if (bookCount >= 10) badges.push('🏛️ Library Builder (10+ Books)');
    if (bookCount >= 20) badges.push('🌍 Book Empire (20+ Books)');
    if (bookCount >= 50) badges.push('🏰 Master Librarian (50+ Books)');

    // Exchange-related badges
    if (exchangeCount >= 1) badges.push('🤝 First Exchange (1+ Exchanges)');
    if (exchangeCount >= 3) badges.push('🤝 Exchange Pro (3+ Exchanges)');
    if (exchangeCount >= 7) badges.push('🌐 Exchange Expert (7+ Exchanges)');
    if (exchangeCount >= 15) badges.push('🔄 Exchange Master (15+ Exchanges)');
    if (exchangeCount >= 30) badges.push('🌍 Global Trader (30+ Exchanges)');

    // Combined activity badges
    if (bookCount >= 1 && exchangeCount >= 1) badges.push('🎉 Active Member');
    if (bookCount >= 5 && exchangeCount >= 3) badges.push('⭐ Rising Star');
    if (bookCount >= 10 && exchangeCount >= 7) badges.push('🌟 Community Leader');
    if (bookCount >= 20 && exchangeCount >= 15) badges.push('🏆 Elite Contributor');
    if (bookCount >= 50 && exchangeCount >= 30) badges.push('👑 Legend of the Trade');

    // Special milestones
    if (bookCount + exchangeCount >= 10) badges.push('🎊 Milestone 10');
    if (bookCount + exchangeCount >= 25) badges.push('🎈 Milestone 25');
    if (bookCount + exchangeCount >= 50) badges.push('🎉 Milestone 50');
    if (bookCount + exchangeCount >= 100) badges.push('🏅 Milestone 100');

    // Consistency badges
    if (bookCount >= 3 && exchangeCount / bookCount >= 0.5) badges.push('⚖️ Balanced Trader');
    if (exchangeCount >= 5 && bookCount / exchangeCount >= 0.5) badges.push('📚 Consistent Contributor');

    return badges;
  };

  return (

      <div className="profile-page">
        {error && <div className="error">{error}</div>}
        {message && <div className="message">{message}</div>}
        {user && (
          <>
            <div className="profile-header" />
            <div className="profile-card">
              <div className="avatar-container">
                <img
                  src={
                    user.avatar
                      ? `http://localhost:5000${user.avatar}?t=${Date.now()}`
                      : '/default-avatar.png'
                  }
                  alt="User Avatar"
                  className="avatar"
                  onError={(e) => {
                    console.log('Avatar load failed. Path:', user.avatar || 'No avatar');
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
    
              <h2 className="username">{user.username}</h2>
              <p className="location">{contactInfo || 'No location info'}</p>
    
              <div className="about">
                <h3>About Me</h3>
                <p>{bio || 'No bio provided yet.'}</p>
              </div>
    
              <div className="contributions">
                <div><strong>Books Added:</strong> {bookCount}</div>
                <div><strong>Successful Exchanges:</strong> {exchangeCount}</div>
              </div>
    
              <div className="badges">
                <h3>Badges</h3>
                {getBadges().length > 0 ? (
                  <div className="badges-list">
                    {getBadges().map((badge, index) => (
                      <span key={index} className="badge">{badge}</span>
                    ))}
                  </div>
                ) : (
                  <p>No badges yet. Start your journey!</p>
                )}
              </div>
    
              <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
    
              {editMode && (
                <form className="edit-form" onSubmit={handleUpdateProfile}>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Your bio (max 200 chars)"
                    maxLength={200}
                    className="bio-input"
                  />
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Contact Information"
                    className="contact-input"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    className="avatar-input"
                  />
                  <button type="submit" className="update-btn">Save Changes</button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    
  );
};

export default Profile;