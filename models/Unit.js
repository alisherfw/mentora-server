const mongoose = require("mongoose");
const Chapter = require("./Chapter");
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
    contents: [
        {
            type: {
                type: String,
                enum: ["text", "image", "video", "quiz"],
                required: true,
                default: "text"
            },
            data: { 
                type: String, 
                required: function() {
                    return this.type !== "quiz";
                },  
                default: ""
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

// Pre-save hook: Add this unit to the chapter's units array
UnitSchema.pre('save', async function(next){
    if(this.isNew) {
        try {
            await Chapter.findByIdAndUpdate(this.chapterId, {
                $addToSet: { units: this._id }
            })
        } catch (error) {
            return next(error)
        }
    }
    next()
})

UnitSchema.set("toJSON", { virtuals: true })

const Unit = mongoose.model("Unit", UnitSchema);

module.exports = Unit;
