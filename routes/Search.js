const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

router.get("/search", async (req, res) => {
    const { searchTerm } = req.query;
    try {
        // Results object init
        const results = {
            users: [],
            courses: []
        }

        // Search for User
        if(searchTerm) {
            const userSearchCriteria = {
                name: { $regex: searchTerm, $options: 'i' } // Case insensitive search
            };
            
            const users = await User.find(userSearchCriteria)
            results.users = users.map(user => ({
                _id: user._id,
                name: user.name, // Include only necessary fields
                profilePicture: user.profilePicture
            }));
        }

        if(searchTerm) {
            const courseSearchCriteria = {
                title: { $regex: searchTerm, $options: 'i' } // case insensitive search
            };
            const courses = await Course.find(courseSearchCriteria);
            results.courses = courses.map(course => ({
                _id: course._id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail // Include only necessary fields
            }));

        }

        res.status(200).json(results);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }   
})

module.exports = router