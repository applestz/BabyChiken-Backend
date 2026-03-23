const mongoose = require('mongoose');

const CarRentalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],
        maxlength: [5, 'Postal code cannot be more than 5 digits']
    },
    tel: {
        type: String
    },
    region: {
        type: String,
        required: [true, 'Please add a region']
    },
    car: {
        type: [String],
        trim: true
    },
    picture: {
        type: String
    },
    priceperday: {
        type: Number
    },
    rentedUser: {
        type: Number
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
CarRentalSchema.virtual('rents',{
    ref: 'Rent',
    localField: '_id',
    foreignField:'carRental',
    justOne: false
});

module.exports = mongoose.model('CarRental', CarRentalSchema);