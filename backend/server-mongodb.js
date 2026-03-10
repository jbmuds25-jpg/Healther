const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const { connectToDatabase, User, userOperations } = require('./database');
const HealtherAIService = require('./services/healtherAI');
const aiRoutes = require('./routes/ai');
const assistantRoutes = require('./routes/assistant');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'healther-dev-secret-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healther';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
let openaiClient = null;
if (OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
}

// Initialize HealtherAI Service
const healtherAI = new HealtherAIService({
    openaiClient,
    debug: process.env.DEBUG === 'true',
    maxTokens: 500,
    emergencyHandler: async (params) => {
        // Log emergency for human review
        console.error('🚨 EMERGENCY ALERT:', params);
        // In production, send notification to emergency services integration
    }
});

// Connect to MongoDB
let dbConnected = false;
connectToDatabase().then(() => {
    dbConnected = true;
    console.log('✅ MongoDB connected successfully');
}).catch(error => {
    console.error('❌ MongoDB connection failed:', error);
});

// Helper function to generate JWT token
function generateToken(user) {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Routes
// Auth routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        // Accept both 'name' and 'fullName' for compatibility with different frontend implementations
        const fullName = req.body.fullName || req.body.name;
        let username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const profile = req.body.profile;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields: fullName/name, email, password' });
        }

        // Generate username from email if not provided
        if (!username) {
            username = email.split("@")[0];
        }

        // Check if user already exists
        const existingUser = await userOperations.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await userOperations.createUser({
            fullName,
            username,
            email,
            password: hashedPassword,
            healtherId: 'H-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
            role: 'citizen',
            badges: ['Welcome Badge'],
            ...profile
        });

        // Update last login
        await userOperations.updateLastLogin(newUser._id);

        // Generate token
        const token = generateToken(newUser);

        // Return safe user data (without password)
        const safeUser = newUser.toJSON();
        delete safeUser.password;

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Citizen signup endpoint for compatibility with existing frontend
app.post('/api/auth/citizen-signup', async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            dateOfBirth,
            nationality,
            countryCode,
            mobileNumber,
            idNumber,
            birthCertificateNumber
        } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields: fullName, email, password' });
        }

        // Generate username from email
        const username = email.split("@")[0];

        // Check if user already exists
        const existingUser = await userOperations.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user with all citizen data
        const newUser = await userOperations.createUser({
            fullName,
            username,
            email,
            password: hashedPassword,
            healtherId: 'H-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
            role: 'citizen',
            badges: ['Welcome Badge'],
            dateOfBirth,
            nationality,
            countryCode,
            mobileNumber,
            idNumber,
            birthCertificateNumber
        });

        // Update last login
        await userOperations.updateLastLogin(newUser._id);

        // Generate token
        const token = generateToken(newUser);

        // Return safe user data (without password)
        const safeUser = newUser.toJSON();
        delete safeUser.password;

        res.status(201).json({
            message: 'Citizen registered successfully',
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Citizen signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }

        // Find user by username, email, or Healther ID
        let user = await userOperations.findByUsername(username);
        if (!user) {
            user = await userOperations.findByEmail(username);
        }
        if (!user) {
            user = await userOperations.findByHealtherId(username);
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await userOperations.updateLastLogin(user._id);

        // Generate token
        const token = generateToken(user);

        // Return safe user data (without password)
        const safeUser = user.toJSON();
        delete safeUser.password;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('+healtherId +username +fullName +role +badges +avatar +dateOfBirth +nationality +mobileNumber +countryCode +idNumber +birthCertificateNumber +memberSince +isActive +lastLogin +createdAt +updatedAt');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return safe user data (without password)
        const safeUser = user.toJSON();
        delete safeUser.password;

        res.json({ user: safeUser });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User routes
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { action, to, profile } = req.body;
        const userId = req.params.id;

        if (action === 'upgrade') {
            await userOperations.updateUser(userId, { role: to });
            return res.json({ message: `User upgraded to ${to}` });
        }

        if (profile) {
            await userOperations.updateUser(userId, { profile });
            return res.json({ message: 'Profile updated' });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await userOperations.getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// AI and Assistant routes
app.use('/api/ai', aiRoutes);
app.use('/api/assistant', assistantRoutes);

// Health Social Hub endpoints
app.get('/api/health-news', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        // Comprehensive health news data from multiple sources
        const healthNews = [
            {
                id: 1,
                title: 'WHO Announces New Global Health Initiative for 2024',
                excerpt: 'World Health Organization launches comprehensive program to address emerging health challenges worldwide.',
                content: 'The World Health Organization today announced a groundbreaking global health initiative aimed at addressing the most pressing health challenges of 2024. The program focuses on preventive care, digital health integration, and equitable access to medical services across all nations.',
                source: 'World Health Organization',
                sourceUrl: 'https://who.int/news/2024/global-health-initiative',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=WHO',
                category: 'policy',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160500-112173e7f151?w=800',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                likes: 892,
                shares: 456,
                downloads: 234,
                country: 'Switzerland',
                region: 'global',
                tags: ['WHO', 'global health', 'policy', '2024']
            },
            {
                id: 2,
                title: 'Revolutionary AI Tool Detects Early Cancer Signs with 95% Accuracy',
                excerpt: 'Breakthrough artificial intelligence system shows remarkable success in early cancer detection across multiple types.',
                content: 'Researchers at leading medical institutions have developed an AI-powered diagnostic tool that can detect early signs of cancer with unprecedented accuracy. The system analyzes medical images, patient data, and genetic markers to identify potential malignancies before symptoms become apparent.',
                source: 'MIT Technology Review',
                sourceUrl: 'https://techreview.mit.edu/ai-cancer-detection',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=MIT',
                category: 'technology',
                contentType: 'video',
                image: 'https://images.unsplash.com/photo-1559755545-2b4d1e72697?w=800',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 1234,
                shares: 789,
                downloads: 567,
                country: 'USA',
                region: 'americas',
                tags: ['AI', 'cancer', 'medical technology', 'diagnostics']
            },
            {
                id: 3,
                title: 'Meditation Apps Show 40% Reduction in Anxiety Symptoms, Study Finds',
                excerpt: 'Comprehensive analysis of digital meditation platforms reveals significant mental health benefits for regular users.',
                content: 'A comprehensive study conducted by mental health researchers has found that regular use of meditation applications can reduce anxiety symptoms by up to 40%. The study tracked over 10,000 users across various meditation platforms for a period of six months.',
                source: 'Mental Health Today',
                sourceUrl: 'https://mentalhealth.today/meditation-apps-study',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=MHT',
                category: 'mental',
                contentType: 'infographic',
                image: 'https://images.unsplash.com/photo-1506905925346-241fddd7a93?w=800',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                likes: 1567,
                shares: 892,
                downloads: 445,
                country: 'UK',
                region: 'europe',
                tags: ['meditation', 'anxiety', 'mental health', 'digital health']
            },
            {
                id: 4,
                title: 'Global Nutrition Study Reveals Optimal Diet for Longevity',
                excerpt: 'Large-scale research across 50 countries identifies key dietary patterns associated with increased lifespan.',
                content: 'A groundbreaking international study involving over 500,000 participants has identified specific dietary patterns that correlate with increased longevity. The research highlights the importance of plant-based foods, omega-3 fatty acids, and reduced sugar consumption.',
                source: 'International Nutrition Institute',
                sourceUrl: 'https://nutrition-institute.org/longevity-diet-study',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=INI',
                category: 'nutrition',
                contentType: 'document',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                likes: 2345,
                shares: 1234,
                downloads: 876,
                country: 'Canada',
                region: 'americas',
                tags: ['nutrition', 'longevity', 'diet', 'research']
            },
            {
                id: 5,
                title: 'Breakthrough Gene Therapy Shows Promise for Rare Diseases',
                excerpt: 'Clinical trials demonstrate successful treatment of previously untreatable genetic conditions using advanced gene editing.',
                content: 'Medical researchers have achieved a major breakthrough in treating rare genetic diseases using CRISPR-based gene therapy. Clinical trials have shown remarkable success rates with minimal side effects, offering hope to millions of patients worldwide.',
                source: 'Genetics Research Institute',
                sourceUrl: 'https://genetics-research.org/gene-therapy-breakthrough',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=GRI',
                category: 'research',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                likes: 3456,
                shares: 1890,
                downloads: 1234,
                country: 'Germany',
                region: 'europe',
                tags: ['gene therapy', 'CRISPR', 'rare diseases', 'medical breakthrough']
            },
            {
                id: 6,
                title: 'Global Fitness Trends 2024: Home Workouts Surge 300%',
                excerpt: 'Post-pandemic fitness preferences shift dramatically toward home-based exercise and virtual training.',
                content: 'The fitness industry has seen unprecedented growth in home workout solutions and virtual training platforms. Industry analysts report a 300% increase in home fitness equipment sales and a dramatic shift toward digital fitness solutions as people continue to prioritize health and wellness from home.',
                source: 'Global Fitness Association',
                sourceUrl: 'https://globalfitness.org/2024-trends-report',
                sourceLogo: 'https://via.placeholder.com/24x24/007AFF/ffffff?text=GFA',
                category: 'fitness',
                contentType: 'video',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                likes: 2890,
                shares: 1456,
                downloads: 789,
                country: 'Australia',
                region: 'asia',
                tags: ['fitness', 'home workouts', 'virtual training', '2024 trends']
            }
        ];
        
        // Apply pagination
        const paginatedNews = healthNews.slice(skip, skip + limit);
        
        res.json({
            content: paginatedNews,
            pagination: {
                page,
                limit,
                total: healthNews.length,
                pages: Math.ceil(healthNews.length / limit)
            }
        });
    } catch (error) {
        console.error('Health news API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// News endpoints for Explore Hub
app.get('/api/news', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Sample news data (in production, this would come from a news API)
        const sampleNews = [
            {
                id: 1,
                title: 'New Breakthrough in Cancer Treatment Shows Promise',
                excerpt: 'Researchers announce a revolutionary approach to treating various cancer types with minimal side effects.',
                content: 'Medical researchers have announced a potential breakthrough in cancer treatment... Full article content here.',
                source: 'Health News Daily',
                sourceUrl: 'https://healthnewsdaily.example.com',
                category: 'research',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160500-112173e7f151?w=800',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                likes: 234,
                shares: 89,
                downloads: 45
            },
            {
                id: 2,
                title: 'Top 10 Foods for Better Heart Health',
                excerpt: 'Discover the best natural foods that can help improve your cardiovascular system.',
                content: 'Heart health is crucial for a long and healthy life. Here are the top foods...',
                source: 'Nutrition Today',
                sourceUrl: 'https://nutritiontoday.example.com',
                category: 'nutrition',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                likes: 567,
                shares: 234,
                downloads: 112
            },
            {
                id: 3,
                title: 'Fitness Experts Share Latest Exercise Trends',
                excerpt: 'Discover the latest fitness trends that are scientifically proven to be effective.',
                content: 'In 2024, several new fitness trends have emerged...',
                source: 'Fitness Central',
                sourceUrl: 'https://fitnesscentral.example.com',
                category: 'fitness',
                contentType: 'video',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                likes: 445,
                shares: 156,
                downloads: 78
            },
            {
                id: 4,
                title: 'Mental Health: Understanding Anxiety Disorders',
                excerpt: 'A comprehensive guide to understanding and managing anxiety disorders.',
                content: 'Anxiety disorders affect millions of people worldwide...',
                source: 'Mental Health Hub',
                sourceUrl: 'https://mentalhealthhub.example.com',
                category: 'mental',
                contentType: 'document',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                likes: 612,
                shares: 289,
                downloads: 198
            },
            {
                id: 5,
                title: 'Latest Health Technology: AI Diagnostics',
                excerpt: 'Artificial Intelligence is revolutionizing medical diagnosis and treatment planning.',
                content: 'AI technology has shown remarkable promise in medical diagnostics...',
                source: 'Health Tech Weekly',
                sourceUrl: 'https://healthtechweekly.example.com',
                category: 'technology',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
                likes: 334,
                shares: 167,
                downloads: 89
            },
            {
                id: 6,
                title: 'COVID-19 Variants: What You Need to Know',
                excerpt: 'Latest information on emerging COVID-19 variants and vaccination strategies.',
                content: 'Health authorities continue to monitor COVID-19 variants...',
                source: 'Global Health Organization',
                sourceUrl: 'https://globalhealthorg.example.com',
                category: 'covid',
                contentType: 'article',
                image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
                likes: 789,
                shares: 445,
                downloads: 267
            }
        ];
        
        // Apply pagination
        const paginatedNews = sampleNews.slice(skip, skip + limit);
        
        res.json({
            news: paginatedNews,
            pagination: {
                page,
                limit,
                total: sampleNews.length,
                pages: Math.ceil(sampleNews.length / limit)
            }
        });
    } catch (error) {
        console.error('News API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: dbConnected ? 'MongoDB connected' : 'MongoDB disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Healther backend listening on http://localhost:${PORT}`);
    console.log('📊 Database: MongoDB');
    console.log('🔐 JWT Secret configured');
    if (OPENAI_API_KEY) {
        console.log('🤖 OpenAI integration enabled');
    }
});
