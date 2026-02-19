const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create category
router.post('/', async (req, res) => {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-');

    try {
        const newCategory = new Category({ name, slug });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        // Optional: Remove category from products or delete products?
        // For now, just set category to null for products
        await Product.updateMany({ category: req.params.id }, { category: null });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
