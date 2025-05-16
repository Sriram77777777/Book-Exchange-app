const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');
const Exchange = require('../models/Exchange');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Add a new book (protected route)
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, author, condition, description } = req.body;

  try {
    if (!title || !author || !condition) {
      return res.status(400).json({ msg: 'Title, author, and condition are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const book = new Book({
      title,
      author,
      condition,
      description: description || '',
      imageUrl,
      owner: req.user,
    });

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all books for the logged-in user (protected route)
router.get('/my-books', auth, async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user }).populate('owner', 'username');
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all available books (excluding user's own books, protected route)
router.get('/available', auth, async (req, res) => {
  try {
    const books = await Book.find({
      status: 'available',
      owner: { $ne: req.user },
      _id: { $nin: await Exchange.distinct('book', { status: 'pending' }) },
    }).populate('owner', 'username');
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a book (protected route)
router.put('/:bookId', auth, upload.single('image'), async (req, res) => {
  const { title, author, condition, description } = req.body;
  const { bookId } = req.params;

  try {
    const book = await Book.findOne({ _id: bookId, owner: req.user });
    if (!book) return res.status(404).json({ msg: 'Book not found or you are not authorized to update it' });

    if (title && typeof title !== 'string') return res.status(400).json({ msg: 'Title must be a string' });
    if (author && typeof author !== 'string') return res.status(400).json({ msg: 'Author must be a string' });
    if (condition && !['New', 'Used', 'Worn'].includes(condition))
      return res.status(400).json({ msg: 'Condition must be New, Used, or Worn' });

    if (title) book.title = title;
    if (author) book.author = author;
    if (condition) book.condition = condition;
    if (description) book.description = description;
    if (req.file) book.imageUrl = `/uploads/${req.file.filename}`;

    await book.save();
    res.json({ msg: 'Book updated successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a book (protected route)
router.delete('/:bookId', auth, async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ msg: 'Invalid book ID format' });
  }

  try {
    const book = await Book.findOneAndDelete({ _id: bookId, owner: req.user });
    if (!book) return res.status(404).json({ msg: 'Book not found or you are not authorized to delete it' });

    await Exchange.deleteMany({ book: bookId, status: 'pending' });

    res.json({ msg: 'Book deleted successfully', deletedBook: book });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Server error while deleting book', error: err.message });
  }
});

// Request an exchange (protected route)
router.post('/request-exchange/:bookId', auth, async (req, res) => {
  const { bookId } = req.params;
  const { offeredBookId, exchangeType } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.owner.toString() === req.user.toString()) return res.status(400).json({ msg: 'Cannot request your own book' });

    const existingRequest = await Exchange.findOne({ book: bookId, status: 'pending' });
    if (existingRequest) return res.status(400).json({ msg: 'Exchange request already pending' });

    let exchangeData = {
      book: bookId,
      requester: req.user,
      owner: book.owner,
      exchangeType: exchangeType || 'book-for-book',
    };

    if (exchangeType === 'book-for-book') {
      if (!offeredBookId) return res.status(400).json({ msg: 'An offered book is required for book-for-book exchange' });
      const offeredBook = await Book.findOne({ _id: offeredBookId, owner: req.user });
      if (!offeredBook) return res.status(400).json({ msg: 'Offered book not found or not owned by you' });
      exchangeData.offeredBook = offeredBookId;
    } else if (exchangeType === 'one-way') {
      exchangeData.offeredBook = null; // No offered book for one-way exchange
    }

    const exchange = new Exchange(exchangeData);
    await exchange.save();
    res.json({ msg: 'Exchange request sent', exchange });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get pending exchange requests (protected route)
router.get('/pending-requests', auth, async (req, res) => {
  try {
    const exchanges = await Exchange.find({ owner: req.user, status: 'pending' })
      .populate('book', 'title author condition description imageUrl') // Populate all needed fields
      .populate('offeredBook', 'title author condition description imageUrl') // Populate all needed fields
      .populate('requester', 'username');
    res.json(exchanges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Accept an exchange (protected route)
router.post('/accept-exchange/:exchangeId', auth, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId)
      .populate('book')
      .populate('offeredBook')
      .populate('requester');
    if (!exchange) return res.status(404).json({ msg: 'Exchange request not found' });
    if (exchange.owner.toString() !== req.user.toString()) {
      return res.status(403).json({ msg: 'Not authorized to accept this request' });
    }
    if (exchange.status !== 'pending') {
      return res.status(400).json({ msg: 'Exchange request is not pending' });
    }

    if (exchange.exchangeType === 'book-for-book' && exchange.offeredBook) {
      // Swap ownership for book-for-book exchange
      await Book.findByIdAndUpdate(exchange.book._id, { owner: exchange.requester._id, status: 'exchanged' });
      await Book.findByIdAndUpdate(exchange.offeredBook._id, { owner: exchange.owner._id, status: 'exchanged' });
    } else if (exchange.exchangeType === 'one-way') {
      // Transfer ownership to requester for one-way exchange
      await Book.findByIdAndUpdate(exchange.book._id, { owner: exchange.requester._id, status: 'exchanged' });
    }

    exchange.status = 'accepted';
    await exchange.save();

    res.json({ msg: 'Exchange request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get sent exchange requests (protected route)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const exchanges = await Exchange.find({ requester: req.user, status: { $in: ['pending', 'accepted', 'rejected'] } })
      .populate('book', 'title author condition description imageUrl') // Populate all needed fields
      .populate('offeredBook', 'title author condition description imageUrl') // Populate all needed fields
      .populate('owner', 'username contactInfo'); // Include contactInfo
    res.json(exchanges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reject an exchange (protected route)
router.post('/reject-exchange/:exchangeId', auth, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) return res.status(404).json({ msg: 'Exchange request not found' });
    if (exchange.owner.toString() !== req.user.toString()) {
      return res.status(403).json({ msg: 'Not authorized to reject this request' });
    }
    if (exchange.status !== 'pending') {
      return res.status(400).json({ msg: 'Exchange request is not pending' });
    }

    exchange.status = 'rejected';
    await exchange.save();

    res.json({ msg: 'Exchange request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;