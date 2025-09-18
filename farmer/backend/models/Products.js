// models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    // Link to the user who is the farmer
    farmer: {
        type: Schema.Types.ObjectId,
        ref: 'User', // This refers to the 'User' model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Vegetable', 'Fruit', 'Grain', 'Dairy', 'Other'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String, // e.g., 'kg', 'dozen', 'litre'
        default: 'kg'
    },
    imageUrl: {
        type: String,
        // In a real app, you'd handle image uploads and store a URL here
        default: 'images/default-product.jpg' 
    },
    quantityAvailable: {
        type: Number,
        required: true
    },
    dateListed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);