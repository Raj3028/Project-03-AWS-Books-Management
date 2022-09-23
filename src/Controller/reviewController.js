//=====================Importing Module and Packages=====================//
const reviewModel = require('../Model/reviewModel')
const bookModel = require('../Model/bookModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validateName, validateISBN, validateDate } = require('../Validator/validator')
const { findOneAndDelete, findOneAndUpdate } = require('../Model/bookModel')




//<<<=====================This function is used for Create Reviews of Books=====================>>>//
const createReview = async (req, res) => {
    try {

        let BookId = req.params.bookId
        let data = req.body

        let { review, rating, reviewedBy, ...rest } = data

        if (!ObjectId.isValid(BookId)) { return res.status(400).send({ status: false, message: `This BookId: ${BookId} is not Valid.` }) }
        // if (isDeleted == true) { return res.status(400).send({ status: false, message: "You can't put isDeleted: true! It should be false at the time of creation (or by default)." }) }
        if (Object.keys(data).length === 0) { return res.status(400).send({ status: false, message: "Please Provide Details to Create Review." }) }
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You have to put only review & rating & reviewedBy,." }) }

        let checkBookId = await bookModel.findOne({ _id: BookId, isDeleted: false })
        if (!checkBookId) { return res.status(400).send({ status: false, message: `Book with this ${BookId} is not Exist or already been deleted.` }) }


        if (reviewedBy && !checkString(reviewedBy) && !validateName(reviewedBy)) { return res.status(400).send({ status: false, message: "Please Provide Valid Name in reviewedBy." }) }
        if (review && !checkString(review) && !validateName(review)) { return res.status(400).send({ status: false, message: "Please Provide Valid Review." }) }


        if (rating === 0) {
            return res.status(400).send({ status: false, message: "Please enter rating in between 1 to 5." })
        }

        if (!rating) { return res.status(400).send({ status: false, message: "Please enter rating" }) }

        if (!rating && checkString(rating)) {
            return res.status(400).send({ status: false, message: "Please enter rating as Number." })
        }

        // if (typeof rating !== "number") {
        //     return res.status(400).send({ status: false, message: "Please enter valid rating." })
        // }


        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Please enter rating in between 1 to 5." })
        }

        if (review && !checkString(review)) {
            return res.status(400).send({ status: false, message: "Please enter valid review." })
        }

        data.bookId = BookId
        data.reviewedAt = Date.now()
        if (!reviewedBy) { reviewedBy = 'Guest' }

        let createReview = await reviewModel.create(data)

        let updateBookData = await bookModel.findByIdAndUpdate({ _id: BookId }, { $inc: { reviews: 1 } }, { new: true })

        let needObj = {
            _id: createReview._id,
            bookId: BookId,
            reviewedBy: createReview.reviewedBy,
            reviewedAt: createReview.reviewedAt,
            rating: createReview.rating,
            review: createReview.review
        }

        updateBookData._doc.reviewData = needObj

        res.status(200).send({ status: true, message: "Success", data: updateBookData })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}
//<<<=====================This function is used for Update Reviews of Books=====================>>>//
const updateReview = async (req, res) => {
    try {

        let dataFromBody = req.body
        let dataFromParam = req.params

        let { review, rating, reviewedBy, ...rest } = dataFromBody
        let { bookId, reviewId } = dataFromParam

        if (!ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` }) }
        if (!ObjectId.isValid(reviewId)) { return res.status(400).send({ status: false, message: `This ReviewId: ${reviewId} is not Valid.` }) }

        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId) { return res.status(400).send({ status: false, message: `This BookID: ${bookId} is not exist in DB.` }) }

        let checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewId) { return res.status(400).send({ status: false, message: `This ReviewID: ${reviewId} is not exist in DB.` }) }


        if (Object.keys(dataFromBody).length === 0) { return res.status(400).send({ status: false, message: "Please Provide Details to Update Review." }) }

        if (reviewedBy && !checkString(reviewedBy) && !validateName(reviewedBy)) { return res.status(400).send({ status: false, message: "Please Provide Valid Name in reviewedBy." }) }

        if (review && !checkString(review) && !validateName(review)) { return res.status(400).send({ status: false, message: "Please Provide Valid Review." }) }


        if (rating && (typeof rating !== "number") && (rating === 0) && (rating < 1 || rating > 5)) {
            return res.status(400).send({ status: false, message: "Please enter valid rating in between range (1 to 5)." })
        }

        // if (rating && ) {
        //     return res.status(400).send({ status: false, message: "Please enter rating in between 1 to 5." })
        // }





        let updateReview = await reviewModel.findByIdAndUpdate({ _id: reviewId },
            { review: review, rating: rating, reviewedBy: reviewedBy }, { new: true })

        let needObj = {
            _id: updateReview._id,
            bookId: updateReview.bookId,
            reviewedBy: updateReview.reviewedBy,
            reviewedAt: updateReview.reviewedAt,
            rating: updateReview.rating,
            review: updateReview.review
        }

        checkBookId._doc.reviewData = needObj

        res.status(200).send({ status: true, message: "Success", data: checkBookId })


    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

//<<<=====================This function is used for Delete Reviews of Books=====================>>>//
const deleteReview = async (req, res) => {
    try {
        let dataFromParam = req.params

        let { bookId, reviewId } = dataFromParam

        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` });
        if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: `This ReviewId: ${reviewId} is not Valid.` });

        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!checkBookId) return res.status(400).send({ status: false, message: `This BookID: ${bookId} is not exist in DB.` });

        let checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!checkReviewId) return res.status(400).send({ status: false, message: `This ReviewID: ${reviewId} is not exist in DB.` });

        let deleteReview = await reviewModel.findOneAndUpdate(
            { _id: reviewId, isDeleted: false, bookdId: bookId },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!deleteReview) return res.status(400).send({ status: false, message: `Review does not found.` });

        let decreaseReviewCountInBooks = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: -1 } },
            { new: true }
        );

        res.status(200).send({ status: true, message: 'Review deleted successfully.' });

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


//=====================Module Export=====================//
module.exports = { createReview, updateReview, deleteReview }