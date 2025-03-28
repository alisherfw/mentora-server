const mongoose = require('mongoose')
const express = require('express')
const Course = require('../models/Course')
const { authenticate, checkOwnership } = require('../middleware/auth')
const Chapter = require('../models/Chapter')
const Unit = require('../models/Unit')
const Enrollment = require('../models/Enrollment')
const User = require('../models/User')
const router = express.Router()

// Get all courses on platform
router.get("/", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        const courses = await Course.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("chapters");
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

        // Handle chapters and units
        const existingChapters = await Chapter.find({ courseId }).lean();

        // Create a set to track updated chapter IDs
        const updatedChapterIds = new Set();

        for (const chapter of chapters) {
            // Check if the chapter already exists
            // If it does, update it; if not, create a new one
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
                // Check if the unit already exists
                // If it does, update it; if not, create a new one
                let unitDoc = existingUnits.find(u => u._id.toString() === unit._id);

                // Check if the unit already exists
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

                // Add the unit ID to the updated set
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

        // Save the course
        await course.save();

        // Return the updated course
        res.status(200).json({ message: "Course updated successfully", course });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Delete course 
router.delete("/:id", authenticate, checkOwnership, async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        // Delete all units and chapters in one step 
        const chapterIds = await Chapter.find({ courseId }).distinct("_id");
        await Unit.deleteMany({ chapterId: { $in: chapterIds } }); // Deletes all units at once
        await Chapter.deleteMany({ courseId });


        // Delete all enrollments related to the course
        await Enrollment.deleteMany({ courseId });

        // Remove the course from the creator's createdCourse list
        await User.findByIdAndUpdate(course.author, {
            $pull: { createdCourses: courseId }
        });

        // Remove the course from all enrolled users
        await User.updateMany(
            { _id: { $in: course.enrolledUsers } },
            { $pull: { enrolledCourses: courseId } }
        );

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.status(200).json({message: "Course deleted successfully!"})

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Enrollment to the course
router.post("/:id/enroll", authenticate, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        // Check if the user is already enrolled
        if (course.enrolledUsers.includes(userId)) {
            return res.status(400).json({ message: "You are already enrolled in this course!" });
        }

        // Enroll the user
        course.enrolledUsers.push(userId);
        await course.save();

        const newEnrollment = new Enrollment({
            userId,
            courseId: course._id
        });
        await newEnrollment.save();

        res.status(200).json({ message: "Successfully enrolled in the course!", course });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// cancel the course
router.post("/:id/cancel", authenticate, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(400).json({ message: "Course not found!" })
        }

        if (!course.enrolledUsers.includes(userId)) {
            return res.status(400).json({ message: "You are not enrolled the course" })
        }

        // Remove the user from the course's enrolledUsers array
        await Enrollment.findOneAndDelete({ userId });

        // Remove the course from the user's enrolledCourses array
        await User.findByIdAndUpdate(userId, {
            $pull: { enrolledCourses: courseId }
        });

        console.log(userId)

        // Remove the user from the course's enrolledUsers array
        await Course.findByIdAndUpdate(courseId, {
            $pull: { enrolledUsers: userId }
        });

        res.status(200).json({ message: "Successfully canceled the course!" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router;