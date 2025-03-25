const mongoose = require('mongoose')
const User = require('./User')

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: { type: String, default: "" },
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
    },
    thumbnail: {
        type: String,
        default: "https://placehold.co/600x400/EEE/31343C"
    }
}, { timestamps: true })

// Add course to user's createdCourses array
CourseSchema.pre('save', async function(next) {
    if(this.isNew) {
        try {
            await User.findByIdAndUpdate(this.author, {
                $addToSet: { createdCourses: this._id } // Correct usage
            })
        } catch (error) {
            return next(error)
        }
    }
    next()
})

const Course = mongoose.model("Course", CourseSchema)

module.exports = Course