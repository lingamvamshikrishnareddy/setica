// server.js - Backend for Setica waitlist
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Connect to MongoDB with improved error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Continue application operation even if DB fails (for development purposes)
});

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
  browsers: {
    type: [String],
    default: []
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

// Initialize counters if they don't exist
async function initializeCounters() {
  try {
    // Interest counter
    const interestCounter = await InterestCount.findOne({ counterId: 'main' });
    if (!interestCounter) {
      await InterestCount.create({ counterId: 'main', count: 0 });
      console.log('Interest counter initialized');
    } else {
      console.log('Interest counter exists with count:', interestCounter.count);
    }

    // Love counter
    const loveCounter = await LoveCount.findOne({ counterId: 'main' });
    if (!loveCounter) {
      await LoveCount.create({ counterId: 'main', count: 0, browsers: [] });
      console.log('Love counter initialized');
    } else {
      console.log('Love counter exists with count:', loveCounter.count);
    }
  } catch (err) {
    console.error('Error initializing counters:', err);
  }
}

// Call initialization function
initializeCounters();

// API Routes
// 1. Get the current interest count
app.get('/api/interest-count', async (req, res) => {
  try {
    const counter = await InterestCount.findOne({ counterId: 'main' });
    console.log('Fetched interest count:', counter ? counter.count : 0);
    res.json({ count: counter ? counter.count : 0 });
  } catch (err) {
    console.error('Error fetching interest count:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
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
    console.log('Incremented interest count to:', counter.count);
    res.json({ success: true, count: counter.count });
  } catch (err) {
    console.error('Error incrementing interest count:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// 3. Get the current love count - ENHANCED
app.get('/api/love-count', async (req, res) => {
  console.log('GET request received for love count');
  try {
    const counter = await LoveCount.findOne({ counterId: 'main' });
    const count = counter ? counter.count : 0;
    console.log('Returning love count:', count);
    res.json({ count: count });
  } catch (err) {
    console.error('Error fetching love count:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// 4. Increment love count - ENHANCED
app.post('/api/love-count/increment', async (req, res) => {
  console.log('POST request received to increment love count');
  console.log('Request body:', req.body);

  try {
    const browserId = req.body.browserId || 'unknown';

    // First find the current document
    let counter = await LoveCount.findOne({ counterId: 'main' });

    if (!counter) {
      // Create if doesn't exist with the first browser ID
      counter = await LoveCount.create({
        counterId: 'main',
        count: 1,
        browsers: [browserId]
      });
      console.log('Created new love counter with count 1');
    } else {
      // Add browser ID if it doesn't exist and increment count
      counter = await LoveCount.findOneAndUpdate(
        { counterId: 'main' },
        {
          $inc: { count: 1 },
          $addToSet: { browsers: browserId },
          lastUpdated: Date.now()
        },
        { new: true }
      );
      console.log('Incremented love count to:', counter.count);
      console.log('Total unique browsers:', counter.browsers.length);
    }

    res.json({ success: true, count: counter.count });
  } catch (err) {
    console.error('Error incrementing love count:', err.stack);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// 5. Add a diagnostic endpoint to see all counter data
app.get('/api/love-count/details', async (req, res) => {
  try {
    const counter = await LoveCount.findOne({ counterId: 'main' });
    res.json({
      count: counter ? counter.count : 0,
      totalBrowsers: counter ? counter.browsers.length : 0,
      lastUpdated: counter ? counter.lastUpdated : null
    });
  } catch (err) {
    console.error('Error fetching love count details:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// 6. Add email to waitlist
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
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Add a route for testing purposes
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).send('Endpoint not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});
