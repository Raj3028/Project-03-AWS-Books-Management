//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require('../Controller/userController')
const { Authentication, Authorisation } = require('../Middleware/auth')
const { createBook, getAllBooks } = require('../Controller/bookController')


//===================== User Registration(Post API) =====================//
router.post("/register", createUser)

//===================== User Login(Post API) =====================//
router.post("/login", loginUser)

//===================== Create Books(Post API) =====================//
router.post("/books",/* Authentication, Authorisation,*/ createBook)

//===================== Get Books(Post API) =====================//
router.get("/books", Authentication, getAllBooks)


//=====================Module Export=====================//
module.exports = router;   