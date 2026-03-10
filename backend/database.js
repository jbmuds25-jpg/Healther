const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healther';
const DB_NAME = 'healther';

// User schema for MongoDB
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    healtherId: { type: String, unique: true },
    role: { type: String, default: 'citizen' },
    badges: [{ type: String }],
    avatar: { type: String },
    dateOfBirth: { type: String },
    nationality: { type: String },
    mobileNumber: { type: String },
    countryCode: { type: String },
    idNumber: { type: String },
    birthCertificateNumber: { type: String },
    memberSince: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Add virtual for safe user data (excludes sensitive fields)
userSchema.virtual('safeUser').get(function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
});

// Create and export the model
const User = mongoose.model('User', userSchema);

// Database connection functions
async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
}

// User CRUD operations
const userOperations = {
    // Create user
    async createUser(userData) {
        try {
            const healtherId = 'H-' + Math.random().toString(36).slice(2, 10).toUpperCase();
            const user = new User({
                ...userData,
                healtherId,
                memberSince: new Date(),
                isActive: true
            });
            return await user.save();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Find user by email
    async findByEmail(email) {
        try {
            return await User.findOne({ email }).select('+password +healtherId +username +fullName +role +badges +avatar +dateOfBirth +nationality +mobileNumber +countryCode +idNumber +birthCertificateNumber +memberSince +isActive +lastLogin +createdAt +updatedAt');
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    },

    // Find User by username
    async findByUsername(username) {
        try {
            return await User.findOne({ username }).select('+password +healtherId +username +fullName +role +badges +avatar +dateOfBirth +nationality +mobileNumber +countryCode +idNumber +birthCertificateNumber +memberSince +isActive +lastLogin +createdAt +updatedAt');
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    },

    // Find user by Healther ID
    async findByHealtherId(healtherId) {
        try {
            return await User.findOne({ healtherId }).select('+password +healtherId +username +fullName +role +badges +avatar +dateOfBirth +nationality +mobileNumber +countryCode +idNumber +birthCertificateNumber +memberSince +isActive +lastLogin +createdAt +updatedAt');
        } catch (error) {
            console.error('Error finding user by healtherId:', error);
            throw error;
        }
    },

    // Update user
    async updateUser(userId, updateData) {
        try {
            return await User.findByIdAndUpdate(
                userId, 
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).select('+healtherId +username +fullName +role +badges +avatar +dateOfBirth +nationality +mobileNumber +countryCode +idNumber +birthCertificateNumber +memberSince +isActive +lastLogin +createdAt +updatedAt');
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Update last login
    async updateLastLogin(userId) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { lastLogin: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    },

    // Get all users (for admin)
    async getAllUsers() {
        try {
            return await User.find({}).select('+healtherId +username +fullName +role +badges +avatar +dateOfBirth +nationality +mobileNumber +countryCode +idNumber +birthCertificateNumber +memberSince +isActive +lastLogin +createdAt +updatedAt');
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    },

    // Delete user
    async deleteUser(userId) {
        try {
            return await User.findByIdAndDelete(userId);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

module.exports = {
    connectToDatabase,
    User,
    userOperations
};
