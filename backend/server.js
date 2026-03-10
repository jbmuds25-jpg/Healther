const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const { encryptUser, decryptUser, getSafeUser } = require('./encryption');
const HealtherAIService = require('./services/healtherAI');
const aiRoutes = require('./routes/ai');
const assistantRoutes = require('./routes/assistant');

const JWT_SECRET = process.env.JWT_SECRET || 'healther-dev-secret-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;

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

const dbDir = path.join(__dirname, 'database');

// Optional: serve ingested external news from local SQLite DB if available
let ingestDb = null;
// If better-sqlite3 is available we may use it; otherwise fall back to JSON file read
try {
	const Database = require('better-sqlite3');
	const ingestDbPath = path.join(__dirname, '..', 'db', 'healther.db');
	ingestDb = new Database(ingestDbPath, { readonly: true });
} catch (e) {
	ingestDb = null;
}

function readJSON(name){
	const p = path.join(dbDir, name);
	try{
		return JSON.parse(fs.readFileSync(p, 'utf8'));
	} catch (err){
		return [];
	}
}

function writeJSON(name, data){
	const p = path.join(dbDir, name);
	fs.writeFileSync(p, JSON.stringify(data, null, 4), 'utf8');
}

app.get('/api/posts', (req, res) => {
	res.json(readJSON('posts.json'));
});

app.post('/api/posts', (req, res) => {
	const posts = readJSON('posts.json');
	const { author, role, content } = req.body;
	if (!content) return res.status(400).json({ error: 'content required' });
	const id = posts.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1;
	const date = new Date().toISOString().slice(0,10);
	const post = { id, author, role, content, date };
	posts.push(post);
	writeJSON('posts.json', posts);
	res.status(201).json(post);
});

// AUTH: signup and login
app.post('/api/auth/signup', (req, res) => {
	const users = readJSON('users.json');
	const { fullName, username, email, password, profile } = req.body || {};
	if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password required' });
	if (users.find(u => u.username === username || decryptUser(u).email === email)) return res.status(409).json({ error: 'user exists' });
	
	const id = users.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1;
	const salt = bcrypt.genSaltSync(10);
	const passwordHash = bcrypt.hashSync(password, salt);
	const healtherId = `H-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
	const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
	
	const newUser = {
		id,
		fullName: fullName || username,
		username,
		email,
		healtherId,
		role: 'citizen',
		passwordHash,
		badges: ['Welcome Badge'],
		upgradedTo: [],
		avatar,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		profile: profile || { gender: 'not-specified', location: '', conditions: [] },
		privacySettings: {
			showProfile: true,
			allowMessaging: true,
			shareData: false
		}
	};
	
	// Encrypt sensitive data
	const encryptedUser = encryptUser(newUser);
	users.push(encryptedUser);
	writeJSON('users.json', users);
	
	const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });
	const safeUser = getSafeUser(decryptUser(encryptedUser));
	res.status(201).json({ token, user: safeUser });
});

// Citizen signup: save citizen registration to Healther DB (login with Healther ID + password later)
app.post('/api/auth/citizen-signup', (req, res) => {
	const users = readJSON('users.json');
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
	} = req.body || {};

	if (!email || !password) return res.status(400).json({ error: 'email and password required' });

	const existing = users.find(u => {
		const decrypted = decryptUser(u);
		return u.username === email.split('@')[0] || decrypted.email === email;
	});
	if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

	const id = users.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1;
	const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user' + id;
	const uniqueUsername = users.some(u => u.username === username) ? username + id : username;
	const salt = bcrypt.genSaltSync(10);
	const passwordHash = bcrypt.hashSync(password, salt);
	const healtherId = `H-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
	const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${uniqueUsername}`;

	const newUser = {
		id,
		fullName: fullName || uniqueUsername,
		username: uniqueUsername,
		email,
		healtherId,
		role: 'citizen',
		passwordHash,
		badges: ['Welcome Badge'],
		upgradedTo: [],
		avatar,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		profile: {
			gender: 'not-specified',
			location: '',
			conditions: [],
			dateOfBirth: dateOfBirth || null,
			nationality: nationality || '',
			phone: mobileNumber || '',
			idNumber: idNumber || '',
			birthCertificateNumber: birthCertificateNumber || ''
		},
		privacySettings: {
			showProfile: true,
			allowMessaging: true,
			shareData: false
		}
	};

	const encryptedUser = encryptUser(newUser);
	users.push(encryptedUser);
	writeJSON('users.json', users);

	const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });
	const safeUser = getSafeUser(decryptUser(encryptedUser));
	res.status(201).json({ token, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
	const users = readJSON('users.json');
	const { username, email, password } = req.body || {};
	if ((!username && !email) || !password) return res.status(400).json({ error: 'username/email/healtherId and password required' });
	
	const user = users.find(u => {
		const decrypted = decryptUser(u);
		return (username && (u.username === username || decrypted.email === username || u.healtherId === username)) ||
		       (email && (decrypted.email === email || u.username === email || u.healtherId === email));
	});
	
	if (!user) return res.status(401).json({ error: 'invalid credentials' });
	
	let ok = false;
	if (user.passwordHash) {
		ok = bcrypt.compareSync(password, user.passwordHash);
	} else if (user.password) {
		// legacy plaintext password support (not secure) - accept for migration
		ok = password === user.password;
	}
	if (!ok) return res.status(401).json({ error: 'invalid credentials' });
	
	const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
	const safeUser = getSafeUser(decryptUser(user));
	res.json({ token, user: safeUser });
});

// return current user from token
app.get('/api/auth/me', (req, res) => {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
	const token = auth.split(' ')[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		const users = readJSON('users.json');
		const user = users.find(u => String(u.id) === String(payload.id));
		if (!user) return res.status(404).json({ error: 'user not found' });
		const safeUser = getSafeUser(decryptUser(user));
		res.json({ user: safeUser });
	} catch (err) {
		return res.status(401).json({ error: 'invalid token' });
	}
});

app.get('/api/users', (req, res) => {
	const users = readJSON('users.json');
	const decryptedUsers = users.map(u => getSafeUser(decryptUser(u)));
	res.json(decryptedUsers);
});

app.get('/api/users/:id', (req, res) => {
	const users = readJSON('users.json');
	const user = users.find(u => String(u.id) === String(req.params.id));
	if (!user) return res.status(404).json({ error: 'user not found' });
	const safeUser = getSafeUser(decryptUser(user));
	res.json(safeUser);
});

app.put('/api/users/:id', (req, res) => {
	const users = readJSON('users.json');
	const idx = users.findIndex(u => String(u.id) === String(req.params.id));
	if (idx === -1) return res.status(404).json({ error: 'user not found' });
	
	const user = decryptUser(users[idx]);
	const payload = req.body || {};
	
	if (payload.action === 'upgrade' && payload.to){
		user.upgradedTo = user.upgradedTo || [];
		if (!user.upgradedTo.includes(payload.to)) user.upgradedTo.push(payload.to);
	}
	if (payload.badge){
		user.badges = user.badges || [];
		if (!user.badges.includes(payload.badge)) user.badges.push(payload.badge);
	}
	// Merge profile updates (simple shallow merge)
	if (payload.profile && typeof payload.profile === 'object'){
		user.profile = user.profile || {};
		Object.assign(user.profile, payload.profile);
	}
	// Merge privacy settings
	if (payload.privacySettings && typeof payload.privacySettings === 'object'){
		user.privacySettings = user.privacySettings || {};
		Object.assign(user.privacySettings, payload.privacySettings);
	}
	
	user.updatedAt = new Date().toISOString();
	
	// Re-encrypt the updated user
	const encryptedUser = encryptUser(user);
	users[idx] = encryptedUser;
	writeJSON('users.json', users);
	
	const safeUser = getSafeUser(user);
	res.json(safeUser);
});

app.get('/api/badges', (req, res) => {
	res.json(readJSON('badges.json'));
});

// Personalized suggestions endpoint (basic rule-based prototype)
app.post('/api/suggestions', (req, res) => {
	const { userId } = req.body || {};
	if (!userId) return res.status(400).json({ error: 'userId required' });
	const users = readJSON('users.json');
	const user = users.find(u => String(u.id) === String(userId));
	if (!user) return res.status(404).json({ error: 'user not found' });

	const suggestions = [];

	// Profile completion suggestion
	if (!user.profile || !user.profile.age || !user.profile.conditions) {
		suggestions.push({
			type: 'profile',
			title: 'Complete your health profile',
			detail: 'Add age and any known conditions to get better personalized suggestions.'
		});
	}

	// Onboarding / engagement suggestion based on badges
	if (!user.badges || user.badges.length === 0) {
		suggestions.push({
			type: 'onboarding',
			title: 'Get started with Healther',
			detail: 'Complete a quick health check and earn your first badge.'
		});
	} else if (user.badges && user.badges.includes('Welcome Badge')) {
		suggestions.push({
			type: 'onboarding',
			title: 'Try the health check',
			detail: 'Take a short health check to receive personalized tips and badges.'
		});
	}

	// Community suggestion using recent posts
	const posts = readJSON('posts.json') || [];
	const recent = posts.slice(-3).map(p => ({ title: `Post by ${p.author}`, detail: (p.content || '').slice(0, 120) }));
	if (recent.length) {
		suggestions.push({
			type: 'community',
			title: 'Recent community posts',
			items: recent
		});
	}

	// Fallback suggestion
	if (suggestions.length === 0) {
		suggestions.push({ type: 'general', title: 'Explore Healther features', detail: 'Browse health tips, community posts, and tools to get started.' });
	}

	res.json({ userId, suggestions });
});

// Mount AI Service Routes
const aiRouter = aiRoutes && typeof aiRoutes === 'function' 
	? aiRoutes(healtherAI, { conversationDir: path.join(__dirname, 'conversations') }) 
	: aiRoutes || express.Router();
app.use('/api/ai', aiRouter);

// Mount AI Assistant Routes
app.use('/api/assistant', assistantRoutes || express.Router());

// Health News API Endpoints
app.get('/api/news', (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const category = req.query.category || null;
	
	// Sample health news data
	const allNews = [
		{
			id: 1,
			title: 'New Breakthrough in Cancer Treatment Shows Promise',
			excerpt: 'Researchers announce a revolutionary approach to treating various cancer types with minimal side effects.',
			content: 'Medical researchers have announced a potential breakthrough in cancer treatment that could change the landscape of oncology. The new approach combines personalized medicine with advanced immunotherapy techniques.',
			source: 'Health News Daily',
			sourceUrl: 'https://healthnewsdaily.example.com/cancer-breakthrough',
			category: 'research',
			contentType: 'article',
			image: 'https://images.unsplash.com/photo-1576091160500-112173e7f151?w=800',
			timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			likes: 234,
			shares: 89,
			downloads: 45
		},
		{
			id: 2,
			title: 'Top 10 Foods for Better Heart Health',
			excerpt: 'Discover the best natural foods that can help improve your cardiovascular system.',
			content: 'Heart health is crucial for a long and healthy life. Incorporating certain foods into your diet can significantly improve your cardiovascular health. Experts recommend...',
			source: 'Nutrition Today',
			sourceUrl: 'https://nutritiontoday.example.com/heart-foods',
			category: 'nutrition',
			contentType: 'article',
			image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
			timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
			likes: 567,
			shares: 234,
			downloads: 112
		},
		{
			id: 3,
			title: 'Fitness Experts Share Latest Exercise Trends',
			excerpt: 'Discover the latest fitness trends that are scientifically proven to be effective.',
			content: 'In 2024, several new fitness trends have emerged that combine traditional exercise with modern technology...',
			source: 'Fitness Central',
			sourceUrl: 'https://fitnesscentral.example.com/trends',
			category: 'fitness',
			contentType: 'video',
			image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
			timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
			likes: 445,
			shares: 156,
			downloads: 78
		},
		{
			id: 4,
			title: 'Mental Health: Understanding Anxiety Disorders',
			excerpt: 'A comprehensive guide to understanding and managing anxiety disorders.',
			content: 'Anxiety disorders affect millions of people worldwide. Understanding the different types and their symptoms is the first step to recovery...',
			source: 'Mental Health Hub',
			sourceUrl: 'https://mentalhealthhub.example.com/anxiety',
			category: 'mental',
			contentType: 'document',
			image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
			timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
			likes: 612,
			shares: 289,
			downloads: 198
		},
		{
			id: 5,
			title: 'Latest Health Technology: AI Diagnostics',
			excerpt: 'Artificial Intelligence is revolutionizing medical diagnosis and treatment planning.',
			content: 'AI technology has shown remarkable promise in medical diagnostics, with accuracy rates exceeding traditional methods...',
			source: 'Health Tech Weekly',
			sourceUrl: 'https://healthtechweekly.example.com/ai-diagnostics',
			category: 'technology',
			contentType: 'article',
			image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
			timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
			likes: 334,
			shares: 167,
			downloads: 89
		},
		{
			id: 6,
			title: 'COVID-19 Variants: What You Need to Know',
			excerpt: 'Latest information on emerging COVID-19 variants and vaccination strategies.',
			content: 'Health authorities continue to monitor COVID-19 variants closely. Even as cases decrease, staying informed is important...',
			source: 'Global Health Organization',
			sourceUrl: 'https://globalhealthorg.example.com/covid-variants',
			category: 'covid',
			contentType: 'article',
			image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
			timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
			likes: 789,
			shares: 445,
			downloads: 267
		}
	];

	// Filter by category if provided
	let filtered = category ? allNews.filter(n => n.category === category) : allNews;
	
	// Pagination
	const start = (page - 1) * limit;
	const end = start + limit;
	const paginated = filtered.slice(start, end);

	res.json({
		success: true,
		page,
		limit,
		total: filtered.length,
		news: paginated
	});
});

app.get('/api/news/:id', (req, res) => {
	const newsId = parseInt(req.params.id);
	
	// In a real app, would query database
	// For now, simulating with static data
	res.json({
		success: true,
		message: 'News detail endpoint ready for implementation'
	});
});

// Return ingested external news stored by the pipeline (SQLite)
app.get('/api/news/ingested', (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const offset = (page - 1) * limit;
	try {
		if (ingestDb) {
			const rows = ingestDb.prepare('SELECT id,title,source,url,publishedAt,summary,credibility,relevance,raw FROM articles ORDER BY datetime(publishedAt) DESC LIMIT ? OFFSET ?').all(limit, offset);
			const news = rows.map(r => {
				let raw = {};
				try { raw = JSON.parse(r.raw || '{}'); } catch (e) { raw = {}; }
				return {
					id: r.id,
					title: r.title,
					excerpt: r.summary || raw.description || '',
					content: raw.content || r.summary || '',
					source: r.source || (raw.source && raw.source.name) || 'External',
					sourceUrl: r.url,
					category: raw.category || null,
					contentType: raw.contentType || 'article',
					image: raw.urlToImage || raw.image || '',
					timestamp: r.publishedAt,
					likes: 0,
					shares: 0,
					downloads: 0,
					credibility: r.credibility,
					relevance: r.relevance,
					raw
				};
			});
			const totalRow = ingestDb.prepare('SELECT COUNT(1) AS cnt FROM articles').get();
			const total = totalRow ? totalRow.cnt : 0;
			return res.json({ success: true, page, limit, total, news });
		}

		// fallback: read JSON file produced by pipeline
		const jsonPath = path.join(__dirname, '..', 'db', 'articles.json');
		if (!fs.existsSync(jsonPath)) return res.json({ success: true, page, limit, total: 0, news: [] });
		const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8') || '[]');
		const sorted = raw.slice().sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
		const items = sorted.slice(offset, offset + limit).map(r => ({
			id: r.id,
			title: r.title,
			excerpt: r.summary || (r.raw && r.raw.description) || '',
			content: (r.raw && r.raw.content) || r.summary || '',
			source: r.source || (r.raw && r.raw.source && r.raw.source.name) || 'External',
			sourceUrl: r.url,
			category: (r.raw && r.raw.category) || null,
			contentType: (r.raw && r.raw.contentType) || 'article',
			image: (r.raw && (r.raw.urlToImage || r.raw.image)) || '',
			timestamp: r.publishedAt,
			likes: 0,
			shares: 0,
			downloads: 0,
			credibility: r.credibility,
			relevance: r.relevance,
			raw: r.raw || {}
		}));
		res.json({ success: true, page, limit, total: raw.length, news: items });
	} catch (e) {
		res.status(500).json({ success: false, error: e.message });
	}
});

// Serve frontend static files
// In Docker, frontend is copied to ./public; locally it's at ../frontend
const staticPath = fs.existsSync(path.join(__dirname, 'public')) 
	? path.join(__dirname, 'public')
	: path.join(__dirname, '..', 'frontend');
app.use(express.static(staticPath));

app.listen(PORT, () => {
	console.log(`Healther backend listening on http://localhost:${PORT}`);
});
