const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get All Orders (Admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Order
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, customerName, email, phone, address, city, province, postalCode, totalAmount } = req.body; // Removed deliveryCharges from destructuring

        let calculatedDeliveryCharges = 0;

        // Verify Stock & Calculate Delivery
        for (const item of items) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }

            // Stock Deduction
            product.stock -= item.quantity;
            await product.save({ session });

            // Delivery Charge Calculation
            if (product.deliveryCharges) {
                if (product.increaseDeliveryWithQty) {
                    calculatedDeliveryCharges += product.deliveryCharges * item.quantity;
                } else {
                    calculatedDeliveryCharges += product.deliveryCharges;
                }
            }
        }

        const order = new Order({
            customerName,
            email,
            phone,
            address,
            city,
            province,
            postalCode,
            items,
            totalAmount: totalAmount + calculatedDeliveryCharges, // Include delivery in total
            deliveryCharges: calculatedDeliveryCharges
        });

        const newOrder = await order.save({ session });
        await session.commitTransaction();
        res.status(201).json(newOrder);

    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// Update Order Status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Order
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
