const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Database connection
const connectDB = require('./config/db');
connectDB();

const scoringRouter = require('./routes/scoring');
const listeningRouter = require('./routes/listening');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PTE Scoring Backend is running' });
});

app.use('/api/scoring', scoringRouter);
app.use('/api/listening', listeningRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
