// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET api/products
// @desc    Get all available products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ dateListed: -1 }).populate('farmer', ['name', 'location']);
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('farmer', ['name', 'location']);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/products
// @desc    Add a new product
// @access  Private (Farmers Only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Check if the user is a farmer
        if (user.role !== 'farmer') {
            return res.status(403).json({ msg: 'Access denied. Only farmers can add products.' });
        }

        const { name, description, category, price, unit, quantityAvailable, imageUrl } = req.body;
        
        const newProduct = new Product({
            name,
            description,
            category,
            price,
            unit,
            quantityAvailable,
            imageUrl,
            farmer: req.user.id 
        });

        const product = await newProduct.save();
        res.json(product);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;