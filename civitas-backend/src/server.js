require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const iotRoutes = require('./routes/iotRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('./config/passport-setup');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin: ' + origin));
    }
  },
  methods: 'GET,HEAD,POST,PUT,PATCH,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadPath));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/announcements', announcementRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/zones', zoneRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Civitas Backend Server');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// FIX: use PORT variable, not process.env.PORT (can be undefined)
app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
});