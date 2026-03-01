require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
    const email = process.argv[2] || 'admin_manager@admin.com';
    const password = process.argv[3] || 'mmmm#1234';

    try {
        console.log(`⏳ Connecting to MongoDB to reset admin: ${email}...`);
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'shopping-hub'
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { upsert: true, new: true }
        );

        console.log(`✅ Admin ${email} has been ${admin.isNew ? 'created' : 'updated'} with the new password.`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting admin:', err.message);
        process.exit(1);
    }
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node reset_admin.js [email] [password]');
    console.log('Default: node reset_admin.js admin_manager@admin.com mmmm#1234');
    process.exit(0);
}

resetAdmin();
