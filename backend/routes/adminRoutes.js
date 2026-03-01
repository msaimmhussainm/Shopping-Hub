const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log(`Admin not found: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log(`Password mismatch for: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log(`Login successful: ${email}`);
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, admin: { id: admin._id, email: admin.email } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
