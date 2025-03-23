const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" // Default profile picture 
    },
    createdCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: [] // Empty for default
    }],
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enrollment",
        default: [] // Empty array for default 
    }]
}, { timestamps: true })

const User = mongoose.model("User", UserSchema)

module.exports = User