const userModel = require("../Model/userModel")
const JWT = require('jsonwebtoken')
const { checkInputsPresent, checkString, validatePincode, validateName, validateEmail, validatePassword, validateTitle, validateMobileNo } = require('../Validator/validator')


//<<<=====================This function is used for Registration User=====================>>>//
const createUser = async (req, res) => {

    try {
        let user = req.body;

        //=====================Destructuring User Data =====================//
        let { title, name, phone, email, password, address } = user

        //=====================Checking User input is Present or Not =====================//
        if (!checkInputsPresent(user)) return res.status(400).send({ status: false, message: "Data is not found." });

        //=====================Checking Mandotory Field=====================//
        if (!(title && name && phone && email && password)) { return res.status(400).send({ status: false, message: "All Fields are Mandatory." }) }

        //=====================Validation of Title=====================//
        if (!checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title." })
        if (!validateTitle(title)) return res.status(400).send({ status: false, message: "Invalid Title! Please put title between ('Mr' or 'Mrs' or 'Miss')." });

        //=====================Validation of Name=====================//
        if (!checkString(name)) return res.status(400).send({ status: false, message: "Please Provide Name." })
        if (!validateName(name)) return res.status(400).send({ status: false, message: "Invalid Name Provided" });

        //=====================Validation of Phone Number=====================//
        if (!checkString(phone)) return res.status(400).send({ status: false, message: "Please Provide Phone Number." })
        if (!validateMobileNo(phone)) return res.status(400).send({ status: false, message: "Invalid Phone Number Provided." });

        //=====================Validation of EmailID=====================//
        if (!checkString(email)) return res.status(400).send({ status: false, message: "Please Provide EmailID." })
        if (!validateEmail(email)) return res.status(400).send({ status: false, message: "Invalid EmailID Format." });

        //=====================Validation of Password=====================//
        if (!checkString(password)) return res.status(400).send({ status: false, message: "Please Provide Password." })
        if (!validatePassword(password)) return res.status(400).send({ status: false, message: "Invalid Password Format." });


        //<<<=====================Checking Address is Present or not.=====================>>>//
        if (address) {

            //=====================Validation of Street Address=====================//
            if (!checkString(address.street)) return res.status(400).send({ status: false, message: "Please Provide Valid Street Address." })
            if (!validateName(address.street)) return res.status(400).send({ status: false, message: "Invalid Street Address Format." });

            //=====================Validation of City Address=====================//
            if (!checkString(address.city)) return res.status(400).send({ status: false, message: "Please Provide Valid City Address." })
            if (!validateName(address.city)) return res.status(400).send({ status: false, message: "Invalid City Address Format." });

            //=====================Validation of Address Pincode=====================//
            if (!validatePincode(address.pincode)) return res.status(400).send({ status: false, message: "Invalid Pincode Format." });
        }

        //=====================Fetching Phone No. from DB and Checking Duplicate Phone No. is Present or Not=====================//
        let checkPhonePresent = await userModel.findOne({ phone: phone })
        if (checkPhonePresent) return res.status(409).send({ status: false, message: `This ${phone} is already registered! Please Use different Phone Number.` })

        //=====================Fetching Email from DB and Checking Duplicate Email is Present or Not=====================//
        let checkEmailPresent = await userModel.findOne({ email: email })
        if (checkEmailPresent) return res.status(409).send({ status: false, message: `This ${email} is already registered! Please Use Different EmailId for Registration.` });



        //x=====================User Registration=====================x//
        let createUser = await userModel.create(user)

        res.status(201).send({ status: true, message: `${name} your registration sucessfully done.`, data: createUser })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}


//<<<=====================This function used for User LogIn=====================>>>//
const loginUser = async (req, res) => {

    try {

        let data = req.body
        let { email, password } = data

        //=====================Checking Mandotory Field=====================//
        if (!(email && password)) { return res.status(400).send({ status: false, message: "All Fields are Mandatory(i.e. email & password)." }) }

        //=====================Checking Format of Email & Password by the help of Regex=====================//
        if (!validateEmail(email)) { return res.status(400).send({ status: false, message: "Please Check EmailID." }) }
        if (!validatePassword(password)) { return res.status(400).send({ status: false, message: "Re-enter your Correct Password." }) }

        //=====================Fetch Data from DB=====================//
        let userData = await userModel.findOne({ email: email, password: password })
        if (!userData) { return res.status(400).send({ status: false, message: "User is not exist. You need to register first." }) }

        //x=====================Token Generation by using JWT=====================x//
        let payload = {
            userId: userData['_id'].toString(),
            EmailId: userData.email,
            Room: '16',
            Batch: 'Plutonium',
            Project: "Books Management",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 30
        }
        let token = JWT.sign({ payload }, "We-are-from-Group-16", /*{ expiresIn: 60 * 30 }*/)

        //x=====================Set Key with value in Response Header=====================x//
        res.setHeader("x-api-key", token)

        //=====================Send Token in Response Body=====================//
        res.status(200).send({ status: true, message: "Token Created Sucessfully", token: token })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


//=====================Module Export=====================//
module.exports = { createUser, loginUser }
