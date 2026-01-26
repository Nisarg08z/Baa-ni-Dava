const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Env loaded:', {
    PORT: process.env.PORT,
    MONGO: process.env.MONGO_URI ? 'Set' : 'Not Set',
    CORS: process.env.CORS_ORIGIN
});

connectDB();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/data', require('./routes/dataRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
