const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: { type: String },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        default: [] // Empty for default
    }],
    enrolledUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enrollment",
        default: [] // Empty for default
    }],
    accessType: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    accessKey: {
        type: String,
        default: null
    }
}, { timestamps: true })

const Course = mongoose.model("Course", CourseSchema)

module.exports = Course