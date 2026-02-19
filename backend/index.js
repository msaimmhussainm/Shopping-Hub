require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// Models
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// Database Connection & Auto-Seeding
const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB Atlas...');

        // Mask password in logs
        const maskedUri = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
        console.log('URI:', maskedUri);

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to db');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'shopping-hub',
            serverSelectionTimeoutMS: 60000
        });

        const isReplicaSet = mongoose.connection.db.admin().command({ isMaster: 1 });
        const status = await isReplicaSet;
        console.log('Is Primary:', status.ismaster);
        console.log('Replica Set Name:', status.setName);
        console.log('Me:', status.me);

        console.log('mongoose connected ✅');
        await seedData();
    } catch (err) {
        console.error('not connected');
        console.error('Error Details:', err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            console.log('Seeding Admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('mmmm#1234', salt);
            await Admin.create({
                email: 'admin_manager@admin.com',
                password: hashedPassword
            });
            console.log('Admin seeded.');
        }

        const productCount = await Product.countDocuments();
        const categoryCount = await Category.countDocuments();

        if (productCount === 0 || categoryCount === 0) {
            console.log('Seeding Data...');

            // Clear existing if partial
            await Product.deleteMany({});
            await Category.deleteMany({});

            // Create Categories
            const electronics = await Category.create({ name: 'Electronics', slug: 'electronics' });
            const fashion = await Category.create({ name: 'Fashion', slug: 'fashion' });
            const home = await Category.create({ name: 'Home & Living', slug: 'home-living' });
            const photography = await Category.create({ name: 'Photography', slug: 'photography' });
            const furniture = await Category.create({ name: 'Furniture', slug: 'furniture' });

            const productsBuffer = [
                {
                    name: 'Wireless Headphones',
                    description: 'Premium noise-cancelling headphones',
                    price: 25000,
                    category: electronics._id,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
                    stock: 50,
                    deliveryCharges: 200
                },
                {
                    name: 'Smart Watch',
                    description: 'Fitness tracker and smartwatch',
                    price: 15000,
                    category: electronics._id,
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
                    stock: 30,
                },
                {
                    name: "Professional Camera Lens",
                    description: "Capture stunning visuals with this 50mm f/1.8 prime lens. Perfect for portraits and low-light photography.",
                    price: 899.99,
                    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80",
                    category: photography._id,
                    stock: 5,
                    rating: 4.9,
                    numReviews: 45
                },
                {
                    name: "Designer Sunglasses",
                    description: " Protect your eyes in style. UV400 protection with durable frames.",
                    price: 199.00,
                    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
                    category: fashion._id,
                    stock: 100,
                    rating: 4.6,
                    numReviews: 60
                },
                {
                    name: "Smart Fitness Tracker",
                    description: "Track your health metrics with precision. Heart rate monitoring, sleep tracking, and GPS.",
                    price: 99.95,
                    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
                    category: electronics._id,
                    stock: 75,
                    rating: 4.4,
                    numReviews: 300
                },
                {
                    name: "Ergonomic Office Chair",
                    description: "Maximize your productivity with this ergonomic office chair. Adjustable lumbar support and breathable mesh back.",
                    price: 249.00,
                    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
                    category: furniture._id,
                    stock: 15,
                    rating: 4.7,
                    numReviews: 200
                }
            ];
            await Product.insertMany(productsBuffer);
            console.log('✅ Data Seeded Successfully');
        }
    } catch (err) {
        console.error('Seeding Error:', err);
    }
};

connectDB();

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Shopping-Hub API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
