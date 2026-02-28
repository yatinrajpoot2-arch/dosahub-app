// server.js

const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');

// Initialize Express
const app = express();

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://<your_mongo_connection_string>', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Razorpay instance
const razorpay = new Razorpay({
    key_id: '<your_razorpay_key_id>',
    key_secret: '<your_razorpay_key_secret>',
});

// Firebase setup
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

// Sample endpoint
app.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;
    const options = {
        amount: amount * 100, // amount in paise
        currency: currency,
        receipt: 'receipt#1',
    };

    try {
        const response = await razorpay.orders.create(options);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});