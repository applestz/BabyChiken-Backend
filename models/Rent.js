const mongoose = require('mongoose');

const RentSchema=new mongoose.Schema ({
    startDate: {
        type: Date,
        required:true
    },
    endDate: {
        type: Date,
        required:true,
        validate: {
            validator: function(value) {
                return value > this.startDate
            },
            message: 'End date must be after start date'
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    carRental: {
        type: mongoose.Schema.ObjectId,
        ref: 'CarRental',
        required: true
    },
    car: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Rent', RentSchema);



