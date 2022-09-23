//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { Authentication, Authorisation } = require('../Middleware/auth')
const { createUser, loginUser } = require('../Controller/userController')
const { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } = require('../Controller/bookController')
const { createReview, updateReview, deleteReview } = require('../Controller/reviewController')



//===================== User Registration(Post API) =====================//
router.post("/register", createUser)

//===================== User Login(Post API) =====================//
router.post("/login", loginUser)

//===================== Create Books(Post API) =====================//
router.post("/books", Authentication, Authorisation, createBook)

//===================== Get Books(Get API) =====================//
router.get("/books", Authentication, getAllBooks)

//===================== Get Books by Path Parameter(Get API) =====================//
router.get("/books/:bookId", Authentication, getBookById)

//===================== Update Books by Path Parameter(Put API) =====================//
router.put("/books/:bookId", Authentication, Authorisation, updateBookById)

//===================== Delete Books by Path Parameter(Delete API) =====================//
router.delete("/books/:bookId", Authentication, Authorisation, deleteBookById)

//===================== Delete Books by Path Parameter(Delete API) =====================//
router.post("/books/:bookId/review", createReview)

//===================== Delete Books by Path Parameter(Delete API) =====================//
router.put("/books/:bookId/review/:reviewId", updateReview)

//===================== Delete Books by Path Parameter(Delete API) =====================//
router.delete("/books/:bookId/review/:reviewId", deleteReview)




//=====================Module Export=====================//
module.exports = router;   