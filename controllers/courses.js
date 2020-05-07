const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//get all courses
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query.Course.find({ bootcampId: req.params.bootcampId });
    } else {
        query = Course.find();
    }

    const courses = await query;
    
});
