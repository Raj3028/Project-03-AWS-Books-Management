//=====================Importing Packages=====================//
const mongoose = require('mongoose')

//=====================Creating User's Schema=====================//
const userModel = new mongoose.Schema({

    title: {
        type: String,
        require: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        min: 8,
        max: 15
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
    
}, { timestamps: true })

//=====================Module Export=====================//
module.exports = mongoose.model('User', userModel)