const moment = require('moment')
const bookModel = require('../Model/bookModel')
const userModel = require("../Model/userModel")
const reviewModel = require('../Model/reviewModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validatePincode, validateName, validateEmail, validatePassword, validateTitle, validateMobileNo, validateISBN, validateDate } = require('../Validator/validator')


const createBook = async (req, res) => {
    try {
        let data = req.body
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data

        if (!(title && excerpt && userId && ISBN && category && subcategory)) {
            return res.status(400).send({ status: false, msg: "All Fields are Mandatory." })
        }


        if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, msg: `${userId} is not Valid.` }) }
        let checkUserId = await userModel.findById(userId)
        if (!checkUserId) { return res.status(400).send({ status: false, msg: `${userId} is not Exist.` }) }


        if (!checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title." })
        if (!validateName(title)) return res.status(400).send({ status: false, msg: "Invalid Title." });

        if (!checkString(excerpt)) return res.status(400).send({ status: false, message: "Please Provide excerpt." })
        if (!validateName(excerpt)) return res.status(400).send({ status: false, msg: "Invalid excerpt." });

        if (!checkString(ISBN)) return res.status(400).send({ status: false, message: "Please Provide ISBN." })
        if (!validateISBN(ISBN)) return res.status(400).send({ status: false, msg: "Invalid ISBN." });


        if (reviews && Object.values(reviews) !== 0) { return res.status(400).send({ status: false, msg: "You can't put reviews now." }) }

        if (!validateDate(releasedAt)) return res.status(400).send({ status: false, msg: `Invalid Date Format. You should use this format (YYYY-MM-DD)` });


        let checkDuplicateTitle = await bookModel.findOne({ title: title })
        if (checkDuplicateTitle) {
            return res.status(400).send({ status: false, msg: `This Book: ${title} is already exist. Please provide another Title.` })
        }

        let checkDuplicateISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkDuplicateISBN) {
            return res.status(400).send({ status: false, msg: `This ISBN: ${ISBN} is already exist. Please provide another ISBN.` })
        }


        let createBook = await bookModel.create(data)

        res.status(201).send({ status: true, msg: `This ${title} is created sucessfully.`, data: createBook })


    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}




const getAllBooks = async (req, res) => {

    try {

        let query = req.query

        if (Object.keys(query).length !== 0) {

            let { userId, category, subcategory, ...rest } = query

            if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, msg: "You have to put only userId or category or subcategory." }) }

            if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, msg: `${userId} is not Valid.` }) }

            if (userId) {
                if (!Object.values(userId)) { return res.status(400).send({ status: false, msg: `Please insert ${userId} value.` }) }
            }

            if (category) {
                if (!Object.values(category)) { return res.status(400).send({ status: false, msg: `Please insert ${category} value.` }) }
            }

            if (subcategory) {
                if (!Object.values(subcategory)) { return res.status(400).send({ status: false, msg: `Please insert ${subcategory} value.` }) }
            }

            if (!(userId || category || subcategory)) { return res.status(400).send({ status: false, msg: "You have to put the value of userId or category or subcategory." }) }


            let obj = {}
            if (userId) obj.userId = userId.trim()
            if (category) obj.category = category.trim()
            if (subcategory) obj.subcategory = subcategory.trim()

            let getDataByQuery = await bookModel.find({ isDeleted: false, ...obj }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })
            if (getDataByQuery.length == 0) { return res.status(400).send({ status: false, msg: "Given data is not exist." }) }

            return res.status(200).send({ status: true, message: 'Books list', data: getDataByQuery })

        }



        let getAllData = await bookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })
        if (getAllData.length == 0) { return res.status(400).send({ status: false, msg: "Given data is not exist." }) }

        res.status(200).send({ status: true, message: 'Books list', data: getAllData })


    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


const getBookFromId = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        let result = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ deletedAt: 0, ISBN: 0, __v: 0 });

        let subcategory =result.subcategory.split(',')
        console.log(subcategory)
        let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false })
        if (result.reviews == 0) result._doc.reviewsData = [];
        else result._doc.reviewData = reviewsData


        res.status(200).send({ status: true, message: 'Books List', data: result })
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
}
















module.exports = { createBook, getAllBooks, getBookFromId }