const mongoose = require("mongoose")

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

const Chapter = mongoose.model("Chapter", ChapterSchema)

module.exports = Chapter