// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace with your MongoDB connection string)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmerMarket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// API Routes
app.get('/', (req, res) => {
    res.send('<h1>Smart Farmer Marketplace API</h1>');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/Product'));
app.use('/api/contact', require('./routes/contact')); // ADD THIS
app.use('/api/cart', require('./routes/cart')); 


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));