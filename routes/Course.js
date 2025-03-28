const mongoose = require('mongoose')
const express = require('express')
const Course = require('../models/Course')
const { authenticate, checkOwnership } = require('../middleware/auth')
const Chapter = require('../models/Chapter')
const Unit = require('../models/Unit')
const router = express.Router()

// Get all courses on platform
router.get("/", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
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
        res.status(500).json({ error: error.message })
    }
})

// Get course by ID
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid course ID format" })
    }

    try {
        const course = await Course.findById(id)
            .populate("chapters")
            .populate({ path: "chapters", populate: { path: "units" } });

        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        res.status(200).json(course);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Create course
router.post("/create", authenticate, async (req, res) => {

    try {

        const { title, description, accessType, chapters } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const newCourse = new Course({
            title,
            description: description || "",
            author: req.user.id,
            accessType: accessType || "public",
        })

        await newCourse.save();

        if (chapters && chapters.length > 0) {
            for (const chapter of chapters) {
                const newChapter = new Chapter({
                    title: chapter.title,
                    courseId: newCourse._id
                });

                await newChapter.save();

                if (chapter.units && chapter.units.length > 0) {
                    for (const unit of chapter.units) {
                        const newUnit = new Unit({
                            title: unit.title,
                            contents: unit.contents,
                            chapterId: newChapter._id
                        })

                        await newUnit.save();

                    }
                }
            }

        }

        res.status(201).json({ message: "Course created successfully", course: newCourse })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update course 

router.put("/:id", authenticate, checkOwnership, async (req, res) => {
    try {
        const { title, description, accessType, chapters } = req.body;
        const courseId = req.params.id;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        // Update course details
        course.title = title;
        course.description = description || "";
        course.accessType = accessType || "public";

        

        const existingChapters = await Chapter.find({ courseId }).lean();

        const updatedChapterIds = new Set();
        for (const chapter of chapters) {
            let chapterDoc = existingChapters.find(ch => ch._id.toString() === chapter._id);

            if (chapterDoc) {
                // Update existing chapter
                await Chapter.findByIdAndUpdate(chapterDoc._id, { title: chapter.title });
            } else {
                // Create new chapter
                chapterDoc = new Chapter({ title: chapter.title, courseId });
                await chapterDoc.save();
            }

            updatedChapterIds.add(chapterDoc._id.toString());

            // Manage Units in Chapter
            const existingUnits = await Unit.find({ chapterId: chapterDoc._id }).lean();
            const updatedUnitIds = new Set();

            for (const unit of chapter.units) {
                let unitDoc = existingUnits.find(u => u._id.toString() === unit._id);

                if (unitDoc) {
                    await Unit.findByIdAndUpdate(unitDoc._id, {
                        title: unit.title,
                        contents: unit.contents,
                        order: unit.order
                    });
                } else {
                    unitDoc = new Unit({
                        title: unit.title,
                        contents: unit.contents,
                        chapterId: chapterDoc._id,
                        order: unit.order
                    });
                    await unitDoc.save();
                }

                updatedUnitIds.add(unitDoc._id.toString());
            }

            // Delete removed units
            await Unit.deleteMany({
                chapterId: chapterDoc._id,
                _id: { $nin: Array.from(updatedUnitIds) }
            });
        }

        // Delete removed chapters
        await Chapter.deleteMany({
            courseId,
            _id: { $nin: Array.from(updatedChapterIds) }
        });

        // Remove chapters from course if they are not in the updated list
        await Course.updateMany(
            { _id: courseId },
            { $pull: { chapters: { $nin: Array.from(updatedChapterIds) } } }
        );

        await course.save();

        res.status(200).json({ message: "Course updated successfully", course });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;