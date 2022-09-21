//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { Authentication, Authorisation } = require('../Middleware/auth')
const { createUser, loginUser } = require('../Controller/userController')
const { createBook, getAllBooks, getBookFromId } = require('../Controller/bookController')




//===================== User Registration(Post API) =====================//
router.post("/register", createUser)

//===================== User Login(Post API) =====================//
router.post("/login", loginUser)

//===================== Create Books(Post API) =====================//
router.post("/books", Authentication, Authorisation, createBook)

//===================== Get Books(Get API) =====================//
router.get("/books", Authentication, getAllBooks)

//===================== Get Books/:Bookid(Get API) =====================//
router.get("/books/:bookId", Authentication, getBookFromId)





//=====================Module Export=====================//
module.exports = router;   