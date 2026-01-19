const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const twoFactorService = require('../services/twoFactorService');
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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
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
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }
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

        if (!user.twoFAEnabled) {
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role }, // include role
                JWT_SECRET_KEY,
                { expiresIn: '1h' }
            );
            res.status(200).json({ message: "Login successful", token, user: user, twoFARequired: false });
        } else {
            // 2FA is enabled, require token
            res.status(202).json({ 
                message: "Two-factor authentication required", 
                twoFARequired: true,
                tempToken: jwt.sign(
                    { id: user._id, email: user.email, role: user.role }, // include role
                    JWT_SECRET_KEY,
                    { expiresIn: '5m' } // short-lived token for 2FA
                )
            });
        }
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login with TOTP Route
router.post('/login/totp', async (req, res) => {
    const { email, password, twoFAToken } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.twoFAEnabled) {
            return res.status(400).json({ error: 'Two-factor authentication not enabled for this account' });
        }

        // Validate password (hashed or legacy plain text)
        let isPasswordValid = false;
        if (user.password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            isPasswordValid = password === user.password;
        }
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

        if (!twoFAToken) {
            return res.status(428).json({ error: 'Two-factor token required', twoFARequired: true });
        }

        const isValid2FA = twoFactorService.verifyToken(user.twoFASecret, twoFAToken);
        if (!isValid2FA) {
            return res.status(401).json({ error: 'Invalid two-factor token', twoFARequired: true });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET_KEY,
            { expiresIn: '1h' },
        );
        return res.status(200).json({ message: 'Login successful', token, user, twoFARequired: false });
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Setup 2FA Route
router.post('/2fa/setup', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.twoFAEnabled) {
            return res.status(400).json({ error: '2FA already enabled' });
        }
        const secretObj = twoFactorService.generateSecret(user.email);
        user.twoFASecret = secretObj.base32;
        await user.save();
        const qrCodeDataURL = await twoFactorService.getQRCodeDataURL(secretObj.otpauth_url);
        res.status(200).json({
            message: '2FA secret generated',
            secret: secretObj.base32,
            otpauthUrl: secretObj.otpauth_url,
            qrCodeDataURL,
        });
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') console.error(err);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// Verify & Enable 2FA Route
router.post('/2fa/verify', async (req, res) => {
    const { userId, token } = req.body;
    try {
        if (!userId || !token) return res.status(400).json({ error: 'userId and token required' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.twoFASecret) return res.status(400).json({ error: '2FA not initialized' });
        if (user.twoFAEnabled) return res.status(400).json({ error: '2FA already active' });
        const isValid = twoFactorService.verifyToken(user.twoFASecret, token);
        if (!isValid) return res.status(401).json({ error: 'Invalid token' });
        user.twoFAEnabled = true;
        // user.twoFABackupCodes = await twoFactorService.generateBackupCodes();
        await user.save();
        res.status(200).json({ message: '2FA enabled' });
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') console.error(err);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Disable 2FA Route
router.post('/2fa/disable', async (req, res) => {
    const { userId, password } = req.body;
    try {
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.twoFAEnabled) return res.status(400).json({ error: '2FA not enabled' });
        if (password) {
            const passOk = user.password.startsWith('$2')
                ? await bcrypt.compare(password, user.password)
                : password === user.password;
            if (!passOk) return res.status(401).json({ error: 'Password invalid' });
        }
        user.twoFAEnabled = false;
        user.twoFASecret = null;
        user.twoFABackupCodes = [];
        await user.save();
        res.status(200).json({ message: '2FA disabled' });
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') console.error(err);
        res.status(500).json({ error: 'Failed to disable 2FA' });
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
