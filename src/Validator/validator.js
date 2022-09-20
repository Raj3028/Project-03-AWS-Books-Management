//<<<===================== Function for validation =====================>>>//

//===================== Checking that there is something as Input =====================//
const checkInputsPresent = (value) => { return (Object.keys(value).length > 0); }

//===================== Validating that the Input must be a non-empty String =====================//
const checkString = (value) => { return ((typeof (value) === 'string' && value.trim().length > 0)); }

//===================== Function to validate the input value with Regex =====================//
const validateName = (name) => { return (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(name)); }
const validateEmail = (email) => { return (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)); }
const validatePassword = (password) => { return (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password)); }
const validateMobileNo = (number) => { return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(number)); }
const validateTitle = (title) => { return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1 }


//=====================Module Export=====================//
module.exports = { checkInputsPresent, checkString, validateName, validateEmail, validatePassword, validateTitle, validateMobileNo }