const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }], // Multiple images
    image: { type: String }, // Backwards compatibility / Main image
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    stock: { type: Number, required: true, default: 0 },
    deliveryCharges: { type: Number, default: 0 },
    increaseDeliveryWithQty: { type: Boolean, default: false },
    sku: { type: String },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
