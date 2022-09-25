//=====================Importing Module and Packages=====================//
const userModel = require("../Model/userModel")
const JWT = require('jsonwebtoken')
const { checkInputsPresent, checkString, validatePincode, validateName, validateSName, validateEmail, validatePassword, validateTitle, validateMobileNo } = require('../Validator/validator')





//<<<=====================This function is used for Registration User=====================>>>//
const createUser = async (req, res) => {

    try {
        let user = req.body;

        //=====================Destructuring User Data =====================//
        let { title, name, phone, email, password, address, ...rest } = user

        //=====================Checking User input is Present or Not =====================//
        if (!checkInputsPresent(user)) return res.status(400).send({ status: false, message: "Request Can't Be Empty." });
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can't input anything except title, name, phone, email, password and address." }) }

        //=====================Validation of Title=====================//
        if (!checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title." })
        if (!validateTitle(title)) return res.status(400).send({ status: false, message: "Invalid Title! Please input title as 'Mr' or 'Mrs' or 'Miss'." });

        //=====================Validation of Name=====================//
        if (!checkString(name)) return res.status(400).send({ status: false, message: "Please Provide Name." })
        if (!validateName(name)) return res.status(400).send({ status: false, message: "Invalid Name Provided" });

        //=====================Validation of Phone Number=====================//
        if (!checkString(phone)) return res.status(400).send({ status: false, message: "Please Provide Phone Number." })
        if (!validateMobileNo(phone)) return res.status(400).send({ status: false, message: "Invalid Phone Number Provided." });

        //=====================Fetching Phone No. from DB and Checking Duplicate Phone No. is Present or Not=====================//
        let checkPhonePresent = await userModel.findOne({ phone: phone })
        if (checkPhonePresent) return res.status(400).send({ status: false, message: `This ${phone} is already registered! Please Use Different Phone Number.` })

        //=====================Validation of EmailID=====================//
        if (!checkString(email)) return res.status(400).send({ status: false, message: "Please Provide EmailID." })
        if (!validateEmail(email)) return res.status(400).send({ status: false, message: "Invalid EmailID Format or Please input all letters in lowercase." });

        //=====================Fetching Email from DB and Checking Duplicate Email is Present or Not=====================//
        let checkEmailPresent = await userModel.findOne({ email: email })
        if (checkEmailPresent) return res.status(400).send({ status: false, message: `This ${email} is already registered! Please Use Different EmailId for Registration.` });

        //=====================Validation of Password=====================//
        if (!checkString(password)) return res.status(400).send({ status: false, message: "Please Provide Password." })
        if (!validatePassword(password)) return res.status(400).send({ status: false, message: "Invalid Password Format! Password Should be 8 to 15 Characters and have a mixture of uppercase and lowercase letters and contain one symbol and then at least one Number." });


        // //<<<=====================Checking Address is Present or not.=====================>>>//
        if (user.hasOwnProperty('address')) {

            if (typeof address !== "object") return res.status(400).send({ status: false, message: "Address is Invalid type, should be an object" });
            if (!checkInputsPresent(address)) return res.status(400).send({ status: false, message: "Address must have atleast one field between (street, city, pincode)" });

            let { street, city, pincode, ...rest } = address

            //===================== Checking Address inputs =====================//   
            if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can't input anything in address except street, city and pincode." }) }

            //=====================Validation of Street Address=====================//
            if (address.hasOwnProperty('street')) {
                if (!checkString(street)) return res.status(400).send({ status: false, msg: `Invalid street (${street}) address Provided.` });
            }
            //=====================Validation of City Address=====================//

            if (address.hasOwnProperty('city')) {
                if (!validateName(city)) return res.status(400).send({ status: false, msg: `Invalid City (${city}) address Provided.` });
            }
            //=====================Validation of Address Pincode=====================//
            if (address.hasOwnProperty('pincode')) {
                if (!validatePincode(pincode)) return res.status(400).send({ status: false, msg: `Invalid Pincode (${pincode}) Provided, provide valid Pincode with 6 Digit Numbers.` });
            }
        }


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
        let { email, password, ...rest } = data

        //=====================Checking User input is Present or Not =====================//
        if (!checkInputsPresent(data)) return res.status(400).send({ status: false, message: "You have to input email and password." });
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only email and password." }) }

        //=====================Checking Format of Email & Password by the help of Regex=====================//
        if (!checkString(email)) return res.status(400).send({ status: false, message: "EmailId required to login" })
        if (!validateEmail(email)) { return res.status(400).send({ status: false, message: "Invalid EmailID Format or Please input all letters in lowercase." }) }

        if (!checkString(password)) return res.status(400).send({ status: false, message: "Password required to login" })
        if (!validatePassword(password)) { return res.status(400).send({ status: false, message: "Re-enter your Correct Password." }) }

        //=====================Fetch Data from DB=====================//
        let userData = await userModel.findOne({ email: email, password: password })
        if (!userData) { return res.status(401).send({ status: false, message: "Invalid Login Credentials! You need to register first." }) }

        //x=====================Token Generation by using JWT=====================x//
        let payload = {
            userId: userData['_id'].toString(),
            EmailId: userData.email,
            Room: '16',
            Batch: 'Plutonium',
            Project: "Books Management",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60
        }
        let token = JWT.sign({ payload }, "We-are-from-Group-16", { expiresIn: 60 * 60 })

        //x=====================Set Key with value in Response Header=====================x//
        res.setHeader("x-api-key", token)

        //=====================Create a Object for Response=====================//
        let obj = { userId: userData['_id'].toString(), token: token, iat: (Math.floor(Date.now() / 1000)), exp: (Math.floor(Date.now() / 1000) + 60 * 60) }

        //=====================Send Token in Response Body=====================//
        res.status(200).send({ status: true, message: "Token Created Sucessfully", data: obj })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}





//=====================Module Export=====================//
module.exports = { createUser, loginUser }
