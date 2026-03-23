const CarRental = require('../models/CarRental');
const Rent = require('../models/Rent');


// @desc    Get all car rentals
// @route   GET /api/v1/carRentals
// @access  Public
exports.getCarRentals = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    if (req.query.search) {
      const keyword = req.query.search;

      reqQuery.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { address: { $regex: keyword, $options: "i" } },
        { district: { $regex: keyword, $options: "i" } },
        { province: { $regex: keyword, $options: "i" } },
        { region: { $regex: keyword, $options: "i" } },
      ];
    }

  delete reqQuery.search;
    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      match => `$${match}`
    );

    // Finding resource + populate rents
    query = CarRental.find(JSON.parse(queryStr)).populate('rents');

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await CarRental.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    const carRentals = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: carRentals.length,
      pagination,
      data: carRentals
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Cannot get car rentals"
    });
  }
};



// @desc    Get single car rental
// @route   GET /api/v1/carRentals/:id
// @access  Public
exports.getCarRental = async (req, res, next) => {
  try {

    const carRental = await CarRental.findById(req.params.id)
      .populate('rents');

    if (!carRental) {
      return res.status(404).json({
        success: false,
        message: `No car rental with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: carRental
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false
    });
  }
};

// @desc    Create car rental
// @route   POST /api/v1/carRentals
// @access  Private (Admin)
exports.createCarRental = async (req, res, next) => {
  try {
    const carRental = await CarRental.create(req.body);

    res.status(201).json({
      success: true,
      data: carRental
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Cannot create car rental"
    });
  }
};



// @desc    Update car rental
// @route   PUT /api/v1/carRentals/:id
// @access  Private (Admin)
exports.updateCarRental = async (req, res, next) => {
  try {

    const carRental = await CarRental.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!carRental) {
      return res.status(404).json({
        success: false,
        message: `No car rental with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: carRental
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false
    });
  }
};



// @desc    Delete car rental
// @route   DELETE /api/v1/carRentals/:id
// @access  Private (Admin)
exports.deleteCarRental = async (req, res, next) => {
  try {

    const carRental = await CarRental.findById(req.params.id);

    if (!carRental) {
      return res.status(404).json({
        success: false,
        message: `Car rental not found with id ${req.params.id}`
      });
    }

    // Delete all rents related to this car rental
    await Rent.deleteMany({ carRental: req.params.id });

    await carRental.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false
    });
  }
};