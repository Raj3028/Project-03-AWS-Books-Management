//=====================Importing Module and Packages=====================//
const JWT = require('jsonwebtoken')
const userModel = require("../Model/userModel")
const bookModel = require('../Model/bookModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString } = require('../Validator/validator')




//<<<=====================This function used for Authentication=====================>>>//
const Authentication = async (req, res, next) => {
    try {

        //=====================Check Presence of Key with Value in Header=====================//
        let token = req.headers['x-api-key']
        if (!token) { return res.status(400).send({ status: false, message: "Token must be Present." }) }

        //=====================Verify token & asigning it's value in request body =====================//
        JWT.verify(token, "We-are-from-Group-16", function (error, decodedToken) {
            if (error) {
                return res.status(401).send({ status: false, message: "Invalid Token." })
            } else {
                req.token = decodedToken
                next()
            }

        })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


//<<<=====================This function used for Authorisation(Phase II)=====================>>>//
const Authorisation = async (req, res, next) => {

    try {

        //<<<===================== Authorising with BookId From Param =====================>>>//
        let bookIdFromParams = req.params.bookId
        if (bookIdFromParams) {

            if (!ObjectId.isValid(bookIdFromParams)) { return res.status(400).send({ status: false, message: `This UserId: ${bookIdFromParams} is not Valid.` }) }

            const checkBookId = await bookModel.findOne({ _id: bookIdFromParams, isDeleted: false })
            if (!checkBookId) { return res.status(404).send({ status: false, message: `This BookId: ${bookIdFromParams} is not Exist! or Already been Deleted.` }) }

            if (checkBookId['userId'].toString() !== req.token.payload.userId) {
                return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
            }

            return next()
        }


        //<<<===================== Authorising with UserId form Body =====================>>>//
        let data = req.body

        let { userId } = data

        if (!checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body!" });

        if (!checkString(userId)) { return res.status(400).send({ status: false, message: "Please Insert userId." }) }
        if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: `This UserId: ${userId} is not Valid.` }) }

        const checkUserId = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!checkUserId) { return res.status(400).send({ status: false, message: `This UserId: ${userId} is not Exist.` }) }

        if (checkUserId['_id'].toString() !== req.token.payload.userId) {
            return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
        }

        next()

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}




//=====================Module Export=====================//
module.exports = { Authentication, Authorisation }