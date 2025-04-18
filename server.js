const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Schemas
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    salary: { type: String, required: true },
    type: { type: String, required: true },
    experience: { type: String, required: true },
    education: { type: String, required: true },
    source: { type: String, required: true },
    applyLink: { type: String },
    status: { type: String, enum: ['Active', 'On Hold', 'Inactive'], default: 'Active' },
    postedDate: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);
const Job = mongoose.model('Job', jobSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || admin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Job Routes
app.get('/api/jobs', async (req, res) => {
    try {
        const { search, experience, type, isAdmin } = req.query;
        const query = isAdmin !== 'true' ? { source: 'External' } : {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        if (experience) query.experience = experience;
        if (type) query.type = type;

        const jobs = await Job.find(query);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
    try {
        const job = new Job(req.body);
        const newJob = await job.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the job is external
        if (job.source === 'External') {
            return res.json(job);
        }

        // For internal jobs, require authentication
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required for internal jobs' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.json(job);
        } catch (error) {
            res.status(403).json({ message: 'Invalid or expired token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job' });
    }
});

app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Initialize admin user
const initializeAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ email: 'admin@careeronjs.com' });
        if (!adminExists) {
            const admin = new Admin({
                email: 'admin@careeronjs.com',
                password: 'admin123'
            });
            await admin.save();
            console.log('Admin user created with email: admin@careeronjs.com');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
connectDB().then(() => {
    initializeAdmin();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}); 