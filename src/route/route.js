//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require('../Controller/userController')


//===================== User Registration(Post API) =====================//
router.post("/register", createUser)

//===================== User Login(Post API) =====================//
router.post("/login", loginUser)





//=====================Module Export=====================//
module.exports = router;   