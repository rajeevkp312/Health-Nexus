// const express=require ('express');
// const mongoose=require('mongoose');
// const adminRoute=require('./Route/adminRoute');
// const doctorRoute=require('./Route/doctorRoute');

// const adminModel = require('../models/adminModel');

// const cors=require('cors');
// // const { default: Addoc } = require('../frontend/src/Admin/Addoc');
// const app=express();
// const port=8000;
// mongoose.connect('mongodb://127.0.0.1:27017/healthnexus')
// .then(()=>console.log("mongo connected success 👌"))
// .catch((err)=>console.log(`Error ${err}`));

// app.use(cors());
// app.use('/api/admin',adminRoute);
// app.use('/api/doctor',doctorRoute);

// app.listen(port,()=>console.log(`Server running on ${port} 👍`));

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const adminRoute = require('./Route/AdminRoute');
const doctorRoute = require('./Route/doctorRoute');
const patientRoute = require('./Route/patientRoute');
const appRoute=require('./Route/appRoute');
const feedRoute=require('./Route/feedRoute');
const newsRoute=require('./Route/newsRoute');
const chatbotRoute = require('./Route/chatbotRoute');
const authRoute = require('./Route/authRoute');
const reportRoute = require('./Route/reportRoute');

const editRoute = require('./Route/editRoute');

const cors = require('cors');

const { EventEmitter } = require('events');
const app = express();
const port = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthnexus7')
  .then(() => console.log("Mongo connected successfully 👌"))
  .catch((err) => console.log(`Error: ${err}`));

// Increase body parser limits to support base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Configure CORS properly
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:3000'];
const envOrigins = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
const corsOptions = {
  origin: envOrigins.length ? envOrigins : defaultOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle payload too large errors gracefully
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ msg: 'Payload too large' });
  }
  next(err);
});

// Serve static files for uploads using absolute path (robust to CWD)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', adminRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/patient', patientRoute);
app.use('/api/doctor', editRoute);
app.use('/api/app',appRoute);
app.use('/api/news',newsRoute);
app.use('/api/feed',feedRoute);
app.use('/api/chatbot', chatbotRoute);
app.use('/api/auth', authRoute);
app.use('/api/reports', reportRoute);

// SSE: Admin activity stream
const activityBus = new EventEmitter();
app.set('activityBus', activityBus);

app.get('/api/admin/activity/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Initial heartbeat so proxies keep connection open
  res.write(': connected\n\n');

  const onActivity = (payload) => {
    try {
      const data = { ...payload, ts: new Date().toISOString() };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (_) {
      // ignore write errors
    }
  };

  activityBus.on('activity', onActivity);

  const keepAlive = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (_) {}
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    activityBus.off('activity', onActivity);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HealthNexus API is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => console.log(`Server running on ${port} 👍`));

// curr mhbp ncre egtc
// npm i nodemailer 

