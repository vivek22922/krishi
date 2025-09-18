// routes/cart.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// @route   GET api/cart
// @desc    Get user's shopping cart
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cart
// @desc    Add an item to the cart
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        
        const user = await User.findById(req.user.id);
        const itemIndex = user.cart.findIndex(p => p.product.toString() === productId);

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            user.cart[itemIndex].quantity += quantity;
        } else {
            // Product does not exist in cart, add new item
            user.cart.push({ product: productId, quantity });
        }
        await user.save();
        const populatedUser = await user.populate('cart.product');
        res.json(populatedUser.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE api/cart/:productId
// @desc    Remove an item from the cart
// @access  Private
router.delete('/:productId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = user.cart.filter(p => p.product.toString() !== req.params.productId);
        await user.save();
        const populatedUser = await user.populate('cart.product');
        res.json(populatedUser.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;