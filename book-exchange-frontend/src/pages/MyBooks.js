import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyBooks.css';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', condition: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editBookId, setEditBookId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books/my-books', {
          headers: { 'x-auth-token': token },
        });
        console.log('Fetched books:', res.data);
        setBooks(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load books');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchBooks();
  }, [token, navigate]);

  const { title, author, condition, description, image } = formData;

  const onChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError('Please upload a valid image file (e.g., .jpg, .png).');
          setFormData({ ...formData, image: null });
          setImagePreview(null);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB.');
          setFormData({ ...formData, image: null });
          setImagePreview(null);
          return;
        }
        setFormData({ ...formData, image: file });
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', title);
    data.append('author', author);
    data.append('condition', condition);
    data.append('description', description);
    if (image) data.append('image', image);

    try {
      if (editBookId) {
        const res = await axios.put(`http://localhost:5000/api/books/${editBookId}`, data, {
          headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' },
        });
        console.log('Update Response:', res.data);
        setBooks(books.map((book) => (book._id === editBookId ? res.data.book : book)));
        setMessage('Book updated successfully!');
      } else {
        const res = await axios.post('http://localhost:5000/api/books', data, {
          headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' },
        });
        console.log('Add Response:', res.data);
        setBooks([...books, res.data]);
        setMessage('Book added successfully!');
      }
      setFormData({ title: '', author: '', condition: '', description: '', image: null });
      setImagePreview(null);
      setEditBookId(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to save book';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (book) => {
    setEditBookId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      condition: book.condition,
      description: book.description,
      image: null,
    });
    setImagePreview(book.imageUrl ? `http://localhost:5000${book.imageUrl}` : null);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
          headers: { 'x-auth-token': token },
        });
        setBooks(books.filter((book) => book._id !== bookId));
        setMessage('Book deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete book');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <div className="my-books-container">
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <section className="section add-edit-section">
        <h2 className="section-title">Add/Edit Book</h2>
        <form onSubmit={onSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="author">Author:</label>
              <input
                type="text"
                id="author"
                name="author"
                value={author}
                onChange={onChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="condition">Condition:</label>
              <select
                id="condition"
                name="condition"
                value={condition}
                onChange={onChange}
                required
              >
                <option value="">Select Condition</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="image">Image:</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={onChange}
                accept="image/*"
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={onChange}
              ></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit">{editBookId ? 'Update' : 'Add'} Book</button>
            {editBookId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditBookId(null);
                  setFormData({ title: '', author: '', condition: '', description: '', image: null });
                  setImagePreview(null);
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="section books-list-section">
        <h2 className="section-title">My Books</h2>
        <div className="books-grid">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              <img
                src={
                  book.imageUrl
                    ? `http://localhost:5000${book.imageUrl}?t=${Date.now()}`
                    : 'https://via.placeholder.com/100?text=No+Image'
                }
                alt={book.title}
                className="book-image"
                key={`${book._id}-${book.imageUrl}`}
                onError={(e) => (e.target.src = 'https://via.placeholder.com/100?text=No+Image')}
              />
              <div className="book-details">
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Condition:</strong> {book.condition}</p>
                <p><strong>Description:</strong> {book.description}</p>
              </div>
              <div className="book-actions">
                <button onClick={() => startEdit(book)}>Edit</button>
                <button onClick={() => handleDelete(book._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MyBooks;