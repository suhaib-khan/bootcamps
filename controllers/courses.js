const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//get all courses
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description',
        });
    }

    const courses = await query;
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
});

// getting course by id
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    });

    if (!course) {
        return next(
            new ErrorResponse(`No course with id ${req.params.id} found.`)
        );
    }

    res.status(200).json({
        success: true,
        data: course,
    });
});
