//=====================Importing Module and Packages=====================//
const moment = require('moment')
const bookModel = require('../Model/bookModel')
const userModel = require("../Model/userModel")
const reviewModel = require('../Model/reviewModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validateName, validateISBN, validateDate } = require('../Validator/validator')


//<<<=====================This function is used for Create Book=====================>>>//
const createBook = async (req, res) => {
    try {
        let data = req.body

        //=====================Destructuring Book Body Data =====================//
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt, ...rest } = data

        //=====================Checking Mandotory Field=====================//
        if (!checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body!" });
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can't input anything except title, excerpt, userId, ISBN, category, subcategory & releasedAt." }) }

        // if (!(title && excerpt && userId && ISBN && category && subcategory && releasedAt)) {
        //     return res.status(400).send({ status: false, message: "All Fields are Mandatory(i.e. title, excerpt, userId, ISBN, category, subcategory, releasedAt)." })
        // }
        // if (userId.trim().length == 0) { return res.status(400).send({ status: false, message: "Please insert valid userId." }) }
        // if (!checkInputsPresent(data)) { return res.status(400).send({ status: false, message: "No data found from body! Provide Mandatory Fields(i.e. title, excerpt, userId, ISBN, category, subcategory, releasedAt)." }) }

        // if (data.isDeleted == true) { return res.status(400).send({ status: false, message: "You can't put isDeleted: true! It should be false at the time of creation (or by default)." }) }

        //=====================Checking the userId is Valid or Not by Mongoose=====================//
        if (!checkString(userId)) { return res.status(400).send({ status: false, message: "Please Insert userId." }) }
        if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: `This UserId: ${userId} is not Valid.` }) }

        //=====================Fetching userId from User DB and Checking userId is Present or Not=====================//
        let checkUserId = await userModel.findById(userId)
        if (!checkUserId) { return res.status(400).send({ status: false, message: `${userId} is not Exist.` }) }

        //=====================Validation of Title=====================//
        if (!checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title." })
        if (!validateName(title)) return res.status(400).send({ status: false, message: "Invalid Title." });

        //=====================Validation of Excerpt=====================//
        if (!checkString(excerpt)) return res.status(400).send({ status: false, message: "Please Provide Excerpt." })
        if (!validateName(excerpt)) return res.status(400).send({ status: false, message: "Invalid Excerpt." });

        //=====================Validation of ISBN=====================//
        if (!checkString(ISBN)) return res.status(400).send({ status: false, message: "Please Provide ISBN." })
        if (!validateISBN(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN." });

        //=====================Validation of category=====================//
        if (!checkString(category)) return res.status(400).send({ status: false, message: "Please Provide Category." })
        if (!validateName(category)) return res.status(400).send({ status: false, message: "Invalid Category." });

        //=====================Validation of subcategory=====================//
        if (!checkString(subcategory)) return res.status(400).send({ status: false, message: "Please Provide Subcategory." })
        if (!validateName(subcategory)) return res.status(400).send({ status: false, message: "Invalid Subcategory." });

        //=====================Checking the value of reviews=====================//
        if (reviews && Object.values(reviews) !== 0) { return res.status(400).send({ status: false, message: "You can't put reviews now." }) }

        //=====================Checking Date Format of releasedAt by Regex=====================//
        if (!checkString(releasedAt)) return res.status(400).send({ status: false, message: "Please Provide releasedAt" });
        if (!validateDate(releasedAt)) return res.status(400).send({ status: false, message: "Invalid Date Format. You should use this format (YYYY-MM-DD)" });


        //=====================Fetching title from DB and Checking Duplicate title is Present or Not=====================//
        let checkDuplicateTitle = await bookModel.findOne({ title: title })
        if (checkDuplicateTitle) {
            return res.status(409).send({ status: false, message: `This Book: ${title} is already exist. Please provide another Title.` })
        }

        //=====================Fetching ISBN from DB and Checking Duplicate ISBN is Present or Not=====================//
        let checkDuplicateISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkDuplicateISBN) {
            return res.status(409).send({ status: false, message: `This ISBN: ${ISBN} is already exist. Please provide another ISBN.` })
        }

        //x=====================Final Creation of Book=====================x//
        let createBook = await bookModel.create(data)

        res.status(201).send({ status: true, message: `This ${title} Book is created sucessfully.`, data: createBook })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


//<<<=====================This function is used for Get All Books=====================>>>//
const getAllBooks = async (req, res) => {

    try {

        let query = req.query

        //====================Check Presence of Query Keys=====================//
        // if (Object.keys(query).length !== 0) {

        //=====================Destructuring User Data from Query =====================//
        let { userId, category, subcategory, ...rest } = query

        //=====================Checking Mandotory Field=====================//
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can put only userId or category or subcategory." }) }
        // if (!(userId || category || subcategory)) { return res.status(400).send({ status: false, message: "You have to put the value of userId or category or subcategory." }) }

        //==================== Storing Query Data in Empty object =====================//
        // let obj = { isDeleted: false }

        // if (userId) {
        //     if (!checkInputsPresent(userId)) { return res.status(400).send({ status: false, message: `Please insert valid userId.` }) }
        //     if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: `This ID: ${userId} is not Valid.` }) }
        //     obj.userId = userId.trim()
        // }

        // if (category) {
        //     if (!checkInputsPresent(category)) { return res.status(400).send({ status: false, message: `Please insert valid category.` }) }
        //     obj.category = category.trim()
        // }

        // if (subcategory) {
        //     if (!checkInputsPresent(subcategory)) { return res.status(400).send({ status: false, message: "Please insert valid subcategory." }) }
        //     obj.subcategory = subcategory.trim()
        // }

        //x=====================Fetching All Data from Book DB=====================x//
        let getDataByQuery = await bookModel.find(query, { isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 })

        //===================== Checking length of getDataByQuery =====================//
        if (getDataByQuery.length == 0) { return res.status(404).send({ status: false, message: "Book data is not exist." }) }

        //===================== Sorting Alphabetically by Title =====================//
        const sortBook = getDataByQuery.sort((a, b) => a.title.localeCompare(b.title))

        return res.status(200).send({ status: true, message: 'Books list', data: sortBook })

        // }


        // //x=====================Fetching All Data from Book DB=====================x//
        // let getAllData = await bookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })

        // //===================== Checking length of getAllData =====================//
        // if (getAllData.length == 0) { return res.status(400).send({ status: false, message: "Book data is not exist." }) }

        // //===================== Sorting Alphabetically by Title =====================//
        // const sortAllBook = getAllData.sort((a, b) => a.title.localeCompare(b.title))

        // res.status(200).send({ status: true, message: 'Books list', data: sortAllBook })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


//<<<=====================This function is used for Get All Books by Path Parameter=====================>>>//
const getBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;

        //=====================Checking the Query is Present or Not=====================//
        if (checkInputsPresent(req.query) || checkInputsPresent(req.body)) { return res.status(400).send({ status: false, message: "You can't put anything in Query or Body." }) }

        //=====================Checking the userId is Valid or Not by Mongoose=====================//
        if (!ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` }) }

        //x=====================Fetching All Data from Book DB=====================x//
        let books = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ deletedAt: 0, ISBN: 0, __v: 0 });
        if (!books) { return res.status(404).send({ status: false, message: "Given data is not exist! No Data Found." }) }

        //=====================Fetching All Data from Review DB and Checking the value of Review=====================//
        let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false })
        // if (result.reviews == 0) result._doc.reviewsData = [];
        books._doc.reviewData = reviewsData

        res.status(200).send({ status: true, message: 'Books List', data: result })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}


//<<<=====================This function is used for Update Books by Path Parameter=====================>>>//
const updateBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        let body = req.body

        //=====================Destructuring Book Data from Body =====================//
        let { title, excerpt, releasedAt, ISBN, ...rest } = body

        //=====================Checking Mandotory Field=====================//
        if (!checkInputsPresent(body)) return res.status(400).send({ status: false, message: "please provide some details(i.e. title, excerpt, releasedAt, ISBN) to update !!!" });
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can put only title or excerpt or releasedAt or ISBN." }) }
        // if (!(title || excerpt || releasedAt || ISBN)) { return res.status(400).send({ status: false, message: "You have to put the  title or excerpt or releasedAt or ISBN." }) }

        //=====================Validation of Title=====================//
        if (body.hasOwnProperty('title') && !checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title." })
        if (title && !validateName(title)) return res.status(400).send({ status: false, message: "Invalid Title." });

        //=====================Validation of Excerpt=====================//
        if (body.hasOwnProperty('excerpt') && !checkString(excerpt)) return res.status(400).send({ status: false, message: "Please Provide Excerpt." })
        if (excerpt && !validateName(excerpt)) return res.status(400).send({ status: false, message: "Invalid Excerpt." });

        //=====================Validation of ISBN=====================//
        if (body.hasOwnProperty('ISBN') && !checkString(ISBN)) return res.status(400).send({ status: false, message: "Please Provide ISBN." })
        if (ISBN && !validateISBN(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN." });
        ""
        //=====================Checking Date Format of releasedAt by Regex=====================//
        if (body.hasOwnProperty('releasedAt') && !validateDate(releasedAt)) return res.status(400).send({ status: false, message: "Invalid Date Format. You should use this format (YYYY-MM-DD)" });


        //=====================Fetching data of Title from DB and Checking Duplicate Title is Present or Not=====================//
        let uniqueTitle = await bookModel.findOne({ title: title })
        if (uniqueTitle) { return res.status(409).send({ status: false, message: `This Title: ${title} is already Present. Please use Another Title.` }) }

        //=====================Fetching data of ISBN from DB and Checking Duplicate ISBN is Present or Not=====================//
        let uniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (uniqueISBN) { return res.status(409).send({ status: false, message: `This ISBN: ${ISBN} is already Present. Please use Another ISBN.` }) }

        //x=====================Update the Book=====================x//
        let updateBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, body, { new: true })

        //=====================Checking the Book Data is Present(Updated) or Not=====================//
        if (!updateBook) { return res.status(404).send({ status: false, message: "No Document Found! Book Updation Unsuccessful" }) }

        res.status(200).send({ status: true, message: 'Success', data: updateBook })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}


//<<<=====================This function is used for Delete Books by Path Parameter=====================>>>//
const deleteBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;

        //=====================We don't accept any input from Query Param=====================//
        if (checkInputsPresent(req.query) || checkInputsPresent(req.body)) { return res.status(400).send({ status: false, message: "You can't put anything in Query or Body." }) }

        if (!ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` }) }
        //=====================Fetching the data of Book(not deleted) then Delete=====================//
        let deleteByBookId = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() }, { new: true })

        //====================Checking the Book Data is Present(Deleted) or Not======================//
        if (!deleteByBookId) { return res.status(404).send({ status: false, message: "No Book Document Found! Book Deletion Unsuccessful" }) }

        res.status(200).send({ status: true, message: `This Book: ${deleteByBookId.title} is Deleted Successfully` })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}



//=====================Module Export=====================//
module.exports = { createBook, getAllBooks, getBookById, updateBookById, deleteBookById }