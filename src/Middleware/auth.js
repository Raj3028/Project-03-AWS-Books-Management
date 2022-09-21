const JWT = require('jsonwebtoken')
const userModel = require("../Model/userModel")
const ObjectId = require('mongoose').Types.ObjectId


const Authentication = async (req, res, next) => {
    try {

        let token = req.headers['x-api-key']
        if (!token) { return res.status(400).send({ status: false, message: "Token must be Present." }) }

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

const Authorisation = async (req, res, next) => {

    try {

        let data = req.body.userId
        if(!data){return res.status(400).send({ status: false, message: "UserId is not Present." })}

        if (data.trim().length == 0) { return res.status(400).send({ status: false, message: "Please insert valid userId." }) }
        if (!ObjectId.isValid(data)) { return res.status(400).send({ status: false, message: `This UserId: ${data} is not Valid.` }) }


        const checkUserId = await userModel.findOne({ _id: data, isDeleted: false })
        if (!checkUserId) { return res.status(400).send({ status: false, message: `This UserId: ${data} is not Exist.` }) }


        if (checkUserId['_id'].toString() !== req.token.payload.userId) {
            return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
        }

        next()

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

module.exports = { Authentication, Authorisation }