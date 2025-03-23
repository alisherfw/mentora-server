const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    items: [
        {
            type: {
                type: String,
                enum: ["text", "image", "video", "quiz"],
                required: true
            },
            data: { 
                type: String, 
                required: function() {
                    return this.type !== "quiz";
                }  
            },
            order: { 
                type: Number, 
                required: true 
            }
        }
    ]
}, { timestamps: true });

// Virtual field: Automatically fetch quizzes for this unit
UnitSchema.virtual("quizzes", {
    ref: "Quiz",
    localField: "_id",
    foreignField: "unitId",
    justOne: false
})

UnitSchema.set("toJSON", { virtuals: true })

const Unit = mongoose.model("Unit", UnitSchema);

module.exports = Unit;
