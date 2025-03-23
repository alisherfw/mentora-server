const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
    unitId: {  // Changed from contentId to unitId
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswerIndex: {
        type: Number, // Stores index of correct answer from options array
        required: true,
        min: 0
    }
}, { timestamps: true });

// QuizSchema.set("toJSON", {
//     transform: function(doc, ret) {
//         delete ret.correctAnswerIndex;
//         return ret;
//     }
// });

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
