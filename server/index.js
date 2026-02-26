const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const scoringRouter = require('./routes/scoring');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PTE Scoring Backend is running' });
});

app.use('/api/scoring', scoringRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
