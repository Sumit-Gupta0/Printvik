/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
    const fs = require('fs');
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            fs.appendFileSync('debug.log', `❌ Auth Middleware: No token provided for ${req.originalUrl}\n`);
            console.log('❌ Auth Middleware: No token provided');
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log('✅ Auth Middleware: Token verified for user ID:', decoded.id);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                fs.appendFileSync('debug.log', `❌ Auth Middleware: User not found for ID: ${decoded.id}\n`);
                console.log('❌ Auth Middleware: User not found for ID:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            fs.appendFileSync('debug.log', `✅ Auth Middleware: User authenticated: ${req.user.email} (${req.user.role})\n`);
            next();
        } catch (err) {
            fs.appendFileSync('debug.log', `❌ Auth Middleware: Token verification failed: ${err.message}\n`);
            console.log('❌ Auth Middleware: Token verification failed:', err.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        fs.appendFileSync('debug.log', `❌ Auth Middleware: Unexpected error: ${error.message}\n`);
        console.error('❌ Auth Middleware: Unexpected error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
