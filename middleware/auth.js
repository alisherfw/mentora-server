const jwt = require('jsonwebtoken');
const Course = require('../models/Course');

const authenticate = async (req, res, next) => {
    const token = req.headers["authorization"];

    // If no token or not in Bearer format, deny access
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied" });
    }

    try {
        // Extract the token (Bearer token format: "Bearer <actual_token>")
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = verified;

        // Move to the next middleware/route
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
}

const checkOwnership = async (req, res, next) => {
    try {
        const { id } = req.params; // ID of the resource being accessed
        const userId = req.user.id;

        // Fetch course
        const course = await Course.findById(id);

        // Check if course exists
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the user is the owner of the course
        if (course.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to edit this course", courseId: id });
        }

        // If ownership check passes, proceed to the next middleware or route handler
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { authenticate, checkOwnership };