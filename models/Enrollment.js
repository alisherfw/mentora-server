const mongoose = require('mongoose')
const User = require('./User')

const EnrollmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    progress: {
        type: Number,
        default: 0 // 0 to 100% course completion
    },
    completedUnits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        default: []
    }]
}, { timestamps: true })

EnrollmentSchema.pre('save', async function(next) {
    if(this.isNew) {
        try {
            await User.findByIdAndUpdate(this.userId, {
                $addToSet: { enrolledCourses: this._id }
            })
        } catch (error) {
            return next(error)
        }
    }
    next()
})

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema)

module.exports = Enrollment