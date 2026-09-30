require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const webhookRoutes = require('./src/routes/webhook');
const apiRoutes = require('./src/routes/api');

app.use('/api/webhook', webhookRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ZenFinance API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
