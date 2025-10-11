const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678'; // Use environment variables in production

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password, gradeLevel, role } = req.body;

    try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                error: "Name, email, password, and role are required" 
            });
        }

        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ 
                error: "Role must be either 'student' or 'teacher'" 
            });
        }

        if (role === 'student') {
            if (gradeLevel && typeof gradeLevel !== 'number') {
                return res.status(400).json({ error: "Grade level must be a number" });
            }
            if (gradeLevel && (gradeLevel < 1 || gradeLevel > 6)) {
                return res.status(400).json({ error: "Grade level must be between 1 and 6" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            gradeLevel: role === 'student' ? (gradeLevel || 1) : undefined
        });

        await user.save();

        res.status(201).json({
            message: "User created successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                gradeLevel: user.gradeLevel,
            }
        });

    } catch (err) {
        console.error(err);
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

        // Handle both hashed and plain text passwords for backward compatibility
        let isPasswordValid = false;
        if (user.password.startsWith('$2')) {
            // Password is hashed (bcrypt hashes start with $2)
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            // Password is plain text (legacy data)
            isPasswordValid = password === user.password;
        }
        
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // include role
            JWT_SECRET_KEY,
            { expiresIn: '1h' }
          );
        res.status(200).json({ message: "Login successful", token, user: user });
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
