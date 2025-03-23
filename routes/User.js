const express = require('express');
const User = require('../models/User');
const mongoose = require('mongoose');

const router = express.Router();


router.get("/:id", async (req, res) => {
    const id = req.params.id;

    // Validate the ID format
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router
