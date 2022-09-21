const JWT = require('jsonwebtoken')
const userModel = require("../Model/userModel")


const Authentication = async (req, res, next) => {
    try {

        let token = req.headers['x-api-key']
        if (!token) { return res.status(400).send({ status: false, msg: "Token must be Present." }) }

        JWT.verify(token, "We-are-from-Group-16", function (error, decodedToken) {
            if (error) {
                return res.status(401).send({ status: false, msg: "Invalid Token." })
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

        const checkUserId = await userModel.findOne({ _id: data, isDeleted: false })
        if (!checkUserId) { return res.status(400).send({ status: false, msg: "User is not Exist." }) }

        if (checkUserId['_id'] !== req.decodedToken.userId) {
            return res.status(403).send({ status: false, msg: "Unauthorized User Access!" })
        }

        next()

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

module.exports = { Authentication, Authorisation }