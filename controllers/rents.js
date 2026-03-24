const Rent = require('../models/Rent');
const CarRental = require('../models/CarRental');


// @desc    Get all rents
// @route   GET /api/v1/rents
// @access  Private
exports.getRents = async (req, res, next) => {
  let query;

  // Normal user → see only their rents
  if (req.user.role !== 'admin') {

    query = Rent.find({ user: req.user.id }).populate({
      path: 'carRental',
      select: 'name address district province picture'
    });

  } else {

    // Admin filter by car rental
    if (req.params.carRentalId) {

      query = Rent.find({
        carRental: req.params.carRentalId
      }).populate({
        path: 'carRental',
        select: 'name address district province picture'
      }).populate({
        path: 'user',
        select: 'username'
      });

    } else {

      query = Rent.find().populate({
        path: 'carRental',
      });

    }
  }

  try {
    const rents = await query;

    res.status(200).json({
      success: true,
      count: rents.length,
      data: rents
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Cannot find Rent'
    });
  }
};



// @desc    Get single rent
// @route   GET /api/v1/rents/:id
// @access  Private
exports.getRent = async (req, res, next) => {
  try {

    const rent = await Rent.findById(req.params.id)
    
    if (req.user.role !== 'admin') {
      rent.populate({
        path: 'carRental',
      }).populate({
        path: 'user',
        select: 'username firstname lastname tel'
      });
    }

    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: rent
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Cannot find Rent'
    });
  }
};



// @desc    Add rent (limit 3 per user)
// @route   POST /api/v1/carRentals/:carRentalId/rents
// @access  Private
exports.addRent = async (req, res, next) => {
  try {

    // Add carRental id to body
    req.body.carRental = req.params.carRentalId;

    // Check car rental exists
    const carRental = await CarRental.findById(req.params.carRentalId);

    if (!carRental) {
      return res.status(404).json({
        success: false,
        message: `No car rental with the id of ${req.params.carRentalId}`
      });
    }

    // Add user id to body
    req.body.user = req.user.id;

    // Limit to 3 rents (non-admin)
    const existedRents = await Rent.find({ user: req.user.id });

    if (existedRents.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `User ${req.user.id} already has 3 rents`
      });
    }

    const rent = await Rent.create(req.body);

    res.status(201).json({
      success: true,
      data: rent
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Cannot create Rent"
    });
  }
};



// @desc    Update rent
// @route   PUT /api/v1/rents/:id
// @access  Private
exports.updateRent = async (req, res, next) => {
  try {

    let rent = await Rent.findById(req.params.id);

    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`
      });
    }

    // Make sure user is owner or admin
    if (
      rent.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this rent`
      });
    }

    rent = await Rent.findById(req.params.id);

    rent.startDate = req.body.startDate ?? rent.startDate;
    rent.endDate = req.body.endDate ?? rent.endDate;
    rent.car = req.body.car ?? rent.car;

    await rent.save();

    res.status(200).json({
      success: true,
      data: rent
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: (`Cannot update rent, ${error.message}`)
    });
  }
};



// @desc    Delete rent
// @route   DELETE /api/v1/rents/:id
// @access  Private
exports.deleteRent = async (req, res, next) => {
  try {

    const rent = await Rent.findById(req.params.id);

    if (!rent) {
      return res.status(404).json({
        success: false,
        message: `No rent with the id of ${req.params.id}`
      });
    }

    // Make sure user is owner or admin
    if (
      rent.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this rent`
      });
    }

    await rent.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete Rent"
    });
  }
};