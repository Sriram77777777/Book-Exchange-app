import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Browse.css';

const Browse = () => {
  const [books, setBooks] = useState([]); // User's books for offering
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedBookForExchange, setSelectedBookForExchange] = useState('');
  const [exchangeType, setExchangeType] = useState('book-for-book');
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
        const [booksRes, availableBooksRes] = await Promise.all([
          axios.get('http://localhost:5000/api/books/my-books', {
            headers: { 'x-auth-token': token },
          }),
          axios.get('http://localhost:5000/api/books/available', {
            headers: { 'x-auth-token': token },
          }),
        ]);
        console.log('My Books Response:', booksRes.data); // Debug log
        console.log('Available Books Response:', availableBooksRes.data); // Debug log
        setBooks(booksRes.data || []);
        if (selectedBookForExchange && !booksRes.data.some((b) => b._id === selectedBookForExchange)) {
          setSelectedBookForExchange('');
        }
        setAvailableBooks(availableBooksRes.data || []);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load books');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, selectedBookForExchange]);

  const handleExchangeRequest = async (bookId) => {
    if (exchangeType === 'book-for-book' && !selectedBookForExchange) {
      setError('Please select a book to offer for exchange.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    const data = { offeredBookId: selectedBookForExchange || null, exchangeType };
    try {
      const res = await axios.post(`http://localhost:5000/api/books/request-exchange/${bookId}`, data, {
        headers: { 'x-auth-token': token },
      });
      setMessage(res.data.msg);
      const availableBooksRes = await axios.get('http://localhost:5000/api/books/available', {
        headers: { 'x-auth-token': token },
      });
      setAvailableBooks(availableBooksRes.data || []);
      setSelectedBookForExchange('');
      setExchangeType('book-for-book');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to send exchange request';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="browse-container">
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <section className="section browse-section">
        <h2 className="section-title">Available Books</h2>
        {availableBooks.length === 0 ? (
          <p>No books available for exchange.</p>
        ) : (
          <div className="books-grid">
            {availableBooks.map((book) => (
              <div key={book._id} className="book-card">
                <img
                  src={
                    book.imageUrl
                      ? `http://localhost:5000${book.imageUrl}?t=${Date.now()}`
                      : 'https://via.placeholder.com/100x150?text=No+Image'
                  }
                  alt={book.title || 'Book Image'}
                  className="book-image"
                  onError={(e) => {
                    console.log('Image load failed for:', book.imageUrl || 'no URL');
                    e.target.src = 'https://via.placeholder.com/100x150?text=Error+Loading';
                  }}
                />
                <div className="book-details">
                  <h3>{book.title || 'Untitled'}</h3>
                  <p><strong>Author:</strong> {book.author || 'Unknown'}</p>
                  <p><strong>Condition:</strong> {book.condition || 'Unknown'}</p>
                  <p><strong>Owner:</strong> {book.owner?.username || 'Unknown'}</p>
                  {book.description && <p><strong>Description:</strong> {book.description}</p>}
                </div>
                <div className="exchange-form">
                  <label htmlFor={`exchangeType-${book._id}`}>Exchange Type</label>
                  <select
                    id={`exchangeType-${book._id}`}
                    value={exchangeType}
                    onChange={(e) => setExchangeType(e.target.value)}
                    className="form-input"
                  >
                    <option value="book-for-book">Book for Book</option>
                    <option value="one-way">Request Without Offering</option>
                  </select>
                  <label htmlFor={`offeredBook-${book._id}`}>Select a Book to Offer</label>
                  <select
                    id={`offeredBook-${book._id}`}
                    value={selectedBookForExchange || ''}
                    onChange={(e) => setSelectedBookForExchange(e.target.value)}
                    className="form-input"
                    disabled={exchangeType === 'one-way'} // Disable when not applicable
                  >
                    <option value="">Select a book</option>
                    {books.map((b) => (
                      <option key={b._id} value={b._id}>{b.title || 'Untitled'}</option>
                    ))}
                  </select>
                  <button onClick={() => handleExchangeRequest(book._id)} className="exchange-btn">
                    Request Exchange
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Browse;