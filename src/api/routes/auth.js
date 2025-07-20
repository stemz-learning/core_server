const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678'; // Use environment variables in production

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password, gradeLevel } = req.body; // CHANGED: grade → gradeLevel
    try {
        // Validate grade level
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: "Name, email, and password are required" 
            });
        }

        if (gradeLevel && typeof gradeLevel !== 'number') {
            return res.status(400).json({
                error: "Grade level must be a number"
            });
        }
        if (gradeLevel && (gradeLevel < 1 || gradeLevel > 6)) {
            return res.status(400).json({ 
                error: "Grade level must be between 1 and 6" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        
        // Create user with gradeLevel (will use default of 1 if not provided)
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            gradeLevel: gradeLevel || 1 // Default to grade 1 if not provided
        });
        
        await user.save();
        
        res.status(201).json({ 
            message: "User created successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                gradeLevel: user.gradeLevel
            }
        });
    } catch (err) {
        console.error(err);
        
        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        
        res.status(400).json({ error: "User creation failed" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Token verification route
router.post('/verify', (req, res) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token not provided' });
        }
    
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
    
        // Send the decoded payload back to the client
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            user: decoded, // Example: { id, email }
        });
    } catch (error) {
        // Handle invalid or expired token
        return res.status(403).json({
            success: false,
            message: 'Authentication failed',
            error: error.message,
        });
    }
});

module.exports = router;
