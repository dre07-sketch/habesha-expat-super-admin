const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request
        next(); // Proceed to next middleware/route
    } catch (err) {
        res.status(403).json({ error: "Invalid token." });
    }
};

module.exports = verifyToken;
