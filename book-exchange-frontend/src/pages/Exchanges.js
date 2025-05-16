import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Exchanges.css';

const Exchanges = () => {
  const [pendingExchanges, setPendingExchanges] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pendingRes, myRequestsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/books/pending-requests', {
            headers: { 'x-auth-token': token },
          }),
          axios.get('http://localhost:5000/api/books/my-requests', {
            headers: { 'x-auth-token': token },
          }),
        ]);
        console.log('Pending Exchanges Response:', pendingRes.data);
        setPendingExchanges(pendingRes.data || []);
        console.log('My Requests Response:', myRequestsRes.data);
        setMyRequests(myRequestsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load exchanges');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleAcceptExchange = async (exchangeId) => {
    console.log('Accepting exchange with ID:', exchangeId);
    try {
      const res = await axios.post(`http://localhost:5000/api/books/accept-exchange/${exchangeId}`, {}, {
        headers: { 'x-auth-token': token },
      });
      console.log('Accept Exchange Response:', res.data);
      setMessage(res.data.msg);
      const [pendingRes, myRequestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/books/pending-requests', {
          headers: { 'x-auth-token': token },
        }),
        axios.get('http://localhost:5000/api/books/my-requests', {
          headers: { 'x-auth-token': token },
        }),
      ]);
      console.log('Updated Pending Exchanges:', pendingRes.data);
      console.log('Updated My Requests:', myRequestsRes.data);
      setPendingExchanges(pendingRes.data || []);
      setMyRequests(myRequestsRes.data || []);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Accept Exchange Error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to accept exchange');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectExchange = async (exchangeId) => {
    console.log('Rejecting exchange with ID:', exchangeId);
    try {
      const res = await axios.post(`http://localhost:5000/api/books/reject-exchange/${exchangeId}`, {}, {
        headers: { 'x-auth-token': token },
      });
      console.log('Reject Exchange Response:', res.data);
      setMessage(res.data.msg);
      const [pendingRes, myRequestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/books/pending-requests', {
          headers: { 'x-auth-token': token },
        }),
        axios.get('http://localhost:5000/api/books/my-requests', {
          headers: { 'x-auth-token': token },
        }),
      ]);
      console.log('Updated Pending Exchanges:', pendingRes.data);
      console.log('Updated My Requests:', myRequestsRes.data);
      setPendingExchanges(pendingRes.data || []);
      setMyRequests(myRequestsRes.data || []);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Reject Exchange Error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to reject exchange');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="exchanges-container">
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <section className="section pending-requests-section">
        <h2 className="section-title">Pending Exchange Requests</h2>
        {pendingExchanges.length === 0 ? (
          <p>No pending exchange requests.</p>
        ) : (
          <div className="requests-grid">
            {pendingExchanges.map((exchange) => {
              console.log(`Exchange ID: ${exchange._id}, Status: ${exchange.status}, Type: ${exchange.exchangeType}`);
              return (
                <div key={exchange._id} className="request-card">
                  <p><strong>Requested Book:</strong> {exchange.book?.title || 'No title available'}</p>
                  {exchange.exchangeType === 'book-for-book' && exchange.offeredBook && (
                    <div className="offered-book-details">
                      <img
                        src={
                          exchange.offeredBook.imageUrl
                            ? `http://localhost:5000${exchange.offeredBook.imageUrl}?t=${Date.now()}`
                            : 'https://via.placeholder.com/100x150?text=No+Image'
                        }
                        alt={exchange.offeredBook.title || 'Offered Book Image'}
                        className="offered-book-image"
                        onError={(e) => {
                          console.log('Offered image load failed for:', exchange.offeredBook.imageUrl || 'no URL');
                          e.target.src = 'https://via.placeholder.com/100x150?text=Error+Loading';
                        }}
                      />
                      <p><strong>Offered Book:</strong> {exchange.offeredBook.title || 'No title available'}</p>
                      <p><strong>Offered Author:</strong> {exchange.offeredBook.author || 'Unknown'}</p>
                      <p><strong>Offered Condition:</strong> {exchange.offeredBook.condition || 'Unknown'}</p>
                      {exchange.offeredBook.description && (
                        <p><strong>Offered Description:</strong> {exchange.offeredBook.description}</p>
                      )}
                    </div>
                  )}
                  <p><strong>Exchange Type:</strong> {exchange.exchangeType || 'Unknown'}</p>
                  <p><strong>Offered By:</strong> {exchange.requester?.username || 'Unknown user'}</p>
                  <div className="request-actions">
                    {exchange.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAcceptExchange(exchange._id)} className="accept-btn">Accept</button>
                        <button onClick={() => handleRejectExchange(exchange._id)} className="reject-btn">Reject</button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section my-requests-section">
        <h2 className="section-title">My Exchange Requests</h2>
        {myRequests.length === 0 ? (
          <p>No exchange requests sent.</p>
        ) : (
          <div className="requests-grid">
            {myRequests.map((request) => (
              <div key={request._id} className="request-card">
                <p><strong>Requested Book:</strong> {request.book?.title || 'No title available'}</p>
                {request.exchangeType === 'book-for-book' && request.offeredBook && (
                  <div className="offered-book-details">
                    <img
                      src={
                        request.offeredBook.imageUrl
                          ? `http://localhost:5000${request.offeredBook.imageUrl}?t=${Date.now()}`
                          : 'https://via.placeholder.com/100x150?text=No+Image'
                      }
                      alt={request.offeredBook.title || 'Offered Book Image'}
                      className="offered-book-image"
                      onError={(e) => {
                        console.log('Offered image load failed for:', request.offeredBook.imageUrl || 'no URL');
                        e.target.src = 'https://via.placeholder.com/100x150?text=Error+Loading';
                      }}
                    />
                    <p><strong>Offered Book:</strong> {request.offeredBook.title || 'No title available'}</p>
                    <p><strong>Offered Author:</strong> {request.offeredBook.author || 'Unknown'}</p>
                    <p><strong>Offered Condition:</strong> {request.offeredBook.condition || 'Unknown'}</p>
                    {request.offeredBook.description && (
                      <p><strong>Offered Description:</strong> {request.offeredBook.description}</p>
                    )}
                  </div>
                )}
                <p><strong>Exchange Type:</strong> {request.exchangeType || 'Unknown'}</p>
                <p><strong>Owner:</strong> {request.owner?.username || 'Unknown'}</p>
                {request.owner?.contactInfo && request.status === 'accepted' && (
                  <p><strong>Contact:</strong> {request.owner.contactInfo}</p>
                )}
                <p><strong>Status:</strong> {request.status || 'Unknown'}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Exchanges;