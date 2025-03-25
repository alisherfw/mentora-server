const mongoose = require('mongoose')
const express = require('express')
const Course = require('../models/Course')
const { authenticate } = require('../middleware/auth')
const Chapter = require('../models/Chapter')
const Unit = require('../models/Unit')
const router = express.Router()

// Get all courses on platform
router.get("/", async (req, res) => {
    try {
        const page = req.params.page || 1;
        const limit = req.params.limit || 10;
        const skip = (page - 1) * limit;

        const courses = await Course.find().skip(skip).limit(limit);
        const totalCourses = await Course.countDocuments();

        res.status(200).json({
            totalCourses,
            totalPages: Math.ceil(totalCourses / limit),
            currentPage: page,
            courses
        })

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get course by ID
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if(!mongoose.isValidObjectId(id)) {
        return res.status(400).json({message: "Invalid course ID format"})
    }

    try {
        const course = await Course.findById(id)
            .populate("chapters")
            .populate({ path: "chapters", populate: { path: "units" } });
            
        if(!course) {
            return res.status(404).json({message: "Course not found"})
        }

        res.status(200).json(course);

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Create course
router.post("/create", authenticate, async(req, res) => {
    
    try {

        const {title, description, accessType, chapters} = req.body;

        if(!title) {
            return res.status(400).json({message: "Title is required"});
        }

        const newCourse = new Course({
            title,
            description: description || "",
            author: req.user.id,
            accessType: accessType || "public",
        })

        await newCourse.save();

        if(chapters && chapters.length > 0) {
            for (const chapter of chapters) {
                const newChapter = new Chapter({
                    title: chapter.title,
                    courseId: newCourse._id
                });
                
                await newChapter.save();

                if(chapter.units && chapter.units.length > 0) {
                    for (const unit of chapter.units) {
                        const newUnit = new Unit({
                            title: unit.title,
                            content: unit.content,
                            chapterId: newChapter._id,
                            order: unit.order
                        })

                        await newUnit.save();
                    }
                }
            }

        }

        res.status(201).json({message: "Course created successfully", course: newCourse})

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


module.exports = router;