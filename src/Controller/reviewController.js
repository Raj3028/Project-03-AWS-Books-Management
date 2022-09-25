//=====================Importing Module and Packages=====================//
const reviewModel = require('../Model/reviewModel')
const bookModel = require('../Model/bookModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validateName } = require('../Validator/validator')




//<<<=====================This function is used for Create Reviews of Books=====================>>>//
const createReview = async (req, res) => {
    try {

        let BookId = req.params.bookId
        let data = req.body

        //=====================Destructuring Review Data from Param and Body=====================//
        let { review, rating, reviewedBy, ...rest } = data

        //=====================Checking the BookId is Valid or Not by Mongoose=====================//
        if (!ObjectId.isValid(BookId)) { return res.status(400).send({ status: false, message: `This BookId: ${BookId} is not Valid.` }) }

        //=====================Checking Mandotory Field=====================//
        if (!checkInputsPresent(data)) { return res.status(400).send({ status: false, message: "Please Provide Details to Create Review." }) }
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You have to put only review & rating & reviewedBy,." }) }

        //=====================Fetching Book Data from Book DB and Checking BookId is Present or Not=====================//
        let checkBookId = await bookModel.findOne({ _id: BookId, isDeleted: false })
        if (!checkBookId) { return res.status(400).send({ status: false, message: `Book with this ${BookId} is not Exist or already been deleted.` }) }

        //===================== Validation of ReviewedBy =====================//
        if (data.hasOwnProperty('reviewedBy')) {
            if (!checkString(reviewedBy) || !validateName(reviewedBy)) return res.status(400).send({ status: false, message: "Please Provide Valid Name in reviewedBy or Delete the key()." });
        }

        //===================== Validation of Review =====================//
        if (data.hasOwnProperty('review')) {
            if (!checkString(review) || !validateName(review)) return res.status(400).send({ status: false, message: "Please Provide Valid Review." });
        }

        //===================== Validation of Rating =====================//
        if (data.hasOwnProperty('rating')) {
            if ((typeof rating !== "number") || (rating === 0) || !(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, message: "Please enter valid rating (number) in between range (1 to 5)." });
            }
        }

        //===================== Checking the Rating is present ot not =====================//
        if (!rating) { return res.status(400).send({ status: false, message: "Please enter Book rating(required)" }) }

        //===================== Creating a BookId Key inside Body and Store the Date value =====================//
        data.bookId = BookId

        //===================== Creating a ReviewedAt Key inside Body and Store the Date value =====================//
        data.reviewedAt = Date.now()

        //x===================== Create Review Document in DB =====================x//
        let createReview = await reviewModel.create(data)

        //x===================== Fetching Book Data byBookId and Update the Book Document =====================x//
        let updateBookData = await bookModel.findByIdAndUpdate({ _id: BookId }, { $inc: { reviews: 1 } }, { new: true })

        let needObj = {
            _id: createReview._id,
            bookId: BookId,
            reviewedBy: createReview.reviewedBy,
            reviewedAt: createReview.reviewedAt,
            rating: createReview.rating,
            review: createReview.review
        }

        //x===================== Fetching Review Object into Book Data =====================x//
        updateBookData._doc.reviewData = needObj

        res.status(201).send({ status: true, message: "Success", data: updateBookData })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

//<<<=====================This function is used for Update Reviews of Books=====================>>>//
const updateReview = async (req, res) => {
    try {

        let dataFromBody = req.body
        let dataFromParam = req.params

        //=====================Destructuring Review Data from Param and Body=====================//
        let { review, rating, reviewedBy, ...rest } = dataFromBody
        let { bookId, reviewId } = dataFromParam

        //=====================Checking the Id is Valid or Not by Mongoose=====================//
        if (!ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` }) }
        if (!ObjectId.isValid(reviewId)) { return res.status(400).send({ status: false, message: `This ReviewId: ${reviewId} is not Valid.` }) }

        //=====================Fetching Book Data from Book DB and Checking BookId is Present or Not=====================//
        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId) { return res.status(400).send({ status: false, message: `This BookID: ${bookId} is not exist in DB! or Already been Deleted.` }) }

        //=====================Fetching Review Data from Review DB and Checking ReviewId is Present or Not=====================//
        let checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewId) { return res.status(400).send({ status: false, message: `This ReviewID: ${reviewId} is not exist in DB! or Already been Deleted.` }) }

        //===================== Checking Mandotory Field =====================//
        if (!checkInputsPresent(dataFromBody)) { return res.status(400).send({ status: false, message: "Please Provide Details to Update Review." }) }
        if (checkInputsPresent(rest)) return res.status(400).send({ status: false, message: "please provide required details only (.i.e. review or rating or reviewedBy or both) " });

        //===================== Validation of ReviewedBy =====================//
        if (dataFromBody.hasOwnProperty('reviewedBy')) {
            if (!checkString(reviewedBy) || !validateName(reviewedBy)) return res.status(400).send({ status: false, message: "Please Provide Valid Name (in string) in reviewedBy." });
        }

        //===================== Validation of Review =====================//
        if (dataFromBody.hasOwnProperty('review')) {
            if (!checkString(review)) {
                return res.status(400).send({ status: false, message: "Please Provide Valid Review (in string) ." });
            }
        }

        //===================== Validation of Rating =====================//
        if (dataFromBody.hasOwnProperty('rating')) {
            if ((typeof rating !== "number") || (rating === 0) || !(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, message: "Please enter valid rating (number) in between range (1 to 5)." });
            }
        }

        //x===================== Fetching Review Data by ReviewId and Update the Review =====================x//
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

        //x===================== Fetching Review Object into Book Data =====================x//
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

        //=====================Destructuring Review Data from Query=====================//
        let { bookId, reviewId } = dataFromParam

        //=====================Checking the Id is Valid or Not by Mongoose=====================//
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` });
        if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: `This ReviewId: ${reviewId} is not Valid.` });

        //===================== Checking the Book data by BookID =====================//
        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!checkBookId) return res.status(404).send({ status: false, message: `This BookID: ${bookId} is not exist in DB! or Already been Deleted.` });

        //===================== Checking the Review data by ReviewID =====================//
        let checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!checkReviewId) return res.status(404).send({ status: false, message: `This ReviewID: ${reviewId} is not exist in DB! or Already been Deleted.` });

        //=====================Checking the Book Reviews is Present or Not in Document=====================//
        if (checkBookId['reviews'] <= 0) return res.status(404).send({ status: false, message: `There is no reviews for the given book with this BookID: ${bookId}.` });

        //x===================== Fetching Review Data by ReviewId with BookId and Delete the Review =====================x//
        let deleteReview = await reviewModel.findOneAndUpdate(
            { _id: reviewId, bookId: bookId, isDeleted: false },
            { $set: { isDeleted: true } });

        if (!deleteReview) return res.status(404).send({ status: false, message: "Data Mismatched! Review does not found." });

        //x===================== Decrese the Book Reviews count after the Review Delete =====================x//
        let decreaseReviewCountInBooks = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: -1 } });

        res.status(200).send({ status: true, message: 'Review Deleted Successfully.' });

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}




//=====================Module Export=====================//
module.exports = { createReview, updateReview, deleteReview }
