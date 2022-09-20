const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId


const reviewModel = new mongoose.Schema({

    bookId: {
        type: ObjectId,
        require: true,
        ref: "Book"
    },
    reviewedBy: {
        type: String,
        require: true,
        default: 'Guest'
        // value: reviewer's name
    },
    reviewedAt: {
        type: date,
        require: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        require: true
    },
    review: {
        type: String,

    },
    isDeleted: {
        type: Boolean,
        default: false
    }


}, { timestamps: true })


module.exports = mongoose.Schema('Review', reviewModel)