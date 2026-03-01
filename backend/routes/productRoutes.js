const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Multer Config - Use Memory Storage for Vercel Serverless Function Compatibility
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all products (with optional category filter)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const products = await Product.find(query).populate('category');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create product with multiple image uploads
router.post('/', upload.array('images', 10), async (req, res) => {
    try {
        const productData = { ...req.body };

        if (req.files && req.files.length > 0) {
            // Convert to Base64 for Serverless Compatibility
            const filesAsBase64 = req.files.map(f => {
                const b64 = Buffer.from(f.buffer).toString('base64');
                return `data:${f.mimetype};base64,${b64}`;
            });
            // First image is the main image
            productData.image = filesAsBase64[0];
            // All images are stored in the images array
            productData.images = filesAsBase64;
        }

        const product = new Product(productData);
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update product
router.put('/:id', upload.array('images', 10), async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.files && req.files.length > 0) {
            // Convert to Base64
            const filesAsBase64 = req.files.map(f => {
                const b64 = Buffer.from(f.buffer).toString('base64');
                return `data:${f.mimetype};base64,${b64}`;
            });
            updateData.image = filesAsBase64[0];
            updateData.images = filesAsBase64;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
