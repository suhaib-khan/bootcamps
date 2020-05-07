const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// get all bootcamps
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    console.log('******: exports.getBootcamps -> req', req.query);
    let query;
    const reqQuery = { ...req.query };

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
    );
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // query select
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        console.log('******: exports.getBootcamps -> fields', fields);
        query = query.select(fields);
    }

    // sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //pagination

    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    //returning results
    const bootcamps = await query;

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
        data: bootcamps,
    });
});

//get single bootcamp
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({ success: true, data: bootcamp });
});

//create bootcamp
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

//update bootcamp
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({ success: true, data: bootcamp });
});

//delete bootcamp
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

    bootcamp.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});

//getting bootcamps within a radius
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    //get longitude/ latitude from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //calculate radius
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});
