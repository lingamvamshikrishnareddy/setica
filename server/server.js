// server.js - Backend for Setica waitlist
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (replace with your MongoDB URL)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const WaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const InterestCountSchema = new mongoose.Schema({
  counterId: {
    type: String,
    default: 'main',
    unique: true
  },
  count: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// New Love Count Schema
const LoveCountSchema = new mongoose.Schema({
  counterId: {
    type: String,
    default: 'main',
    unique: true
  },
  count: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create models
const Waitlist = mongoose.model('Waitlist', WaitlistSchema);
const InterestCount = mongoose.model('InterestCount', InterestCountSchema);
const LoveCount = mongoose.model('LoveCount', LoveCountSchema);

// Initialize interest counter if it doesn't exist
async function initializeCounters() {
  try {
    const interestCounter = await InterestCount.findOne({ counterId: 'main' });
    if (!interestCounter) {
      await InterestCount.create({ counterId: 'main', count: 0 });
      console.log('Interest counter initialized');
    }
    
    // Initialize love counter if it doesn't exist
    const loveCounter = await LoveCount.findOne({ counterId: 'main' });
    if (!loveCounter) {
      await LoveCount.create({ counterId: 'main', count: 0 });
      console.log('Love counter initialized');
    }
  } catch (err) {
    console.error('Error initializing counters:', err);
  }
}
initializeCounters();

// API Routes
// 1. Get the current interest count
app.get('/api/interest-count', async (req, res) => {
  try {
    const counter = await InterestCount.findOne({ counterId: 'main' });
    res.json({ count: counter ? counter.count : 0 });
  } catch (err) {
    console.error('Error fetching interest count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Increment interest count
app.post('/api/interest-count/increment', async (req, res) => {
  try {
    const counter = await InterestCount.findOneAndUpdate(
      { counterId: 'main' },
      { $inc: { count: 1 }, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, count: counter.count });
  } catch (err) {
    console.error('Error incrementing interest count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get the current love count
app.get('/api/love-count', async (req, res) => {
  try {
    const counter = await LoveCount.findOne({ counterId: 'main' });
    res.json({ count: counter ? counter.count : 0 });
  } catch (err) {
    console.error('Error fetching love count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Increment love count
app.post('/api/love-count/increment', async (req, res) => {
  try {
    const counter = await LoveCount.findOneAndUpdate(
      { counterId: 'main' },
      { $inc: { count: 1 }, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, count: counter.count });
  } catch (err) {
    console.error('Error incrementing love count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Add email to waitlist
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Check if email already exists
    const existingEmail = await Waitlist.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already on waitlist' });
    }
    
    // Add to waitlist
    const newEntry = new Waitlist({ email });
    await newEntry.save();
    
    res.status(201).json({ success: true, message: 'Added to waitlist' });
  } catch (err) {
    console.error('Error adding to waitlist:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
