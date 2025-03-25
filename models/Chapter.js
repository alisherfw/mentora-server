const mongoose = require("mongoose")
const Course = require("./Course")
const ChapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    units: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        default: []
    }]

}, { timestamps: true })

// Add chapter to course's chapters array
ChapterSchema.pre('save', async function(next) {
    if(this.isNew) {
        try {
            await Course.findByIdAndUpdate(this.courseId, {
                $addToSet: { chapters: this._id }
            })
        } catch (error) {
            return next(error)
        }
    }
    next()
})

const Chapter = mongoose.model("Chapter", ChapterSchema)

module.exports = Chapter