/**
 * Error names are in the following format
 * CONTROLLER_FIELD_DESCRIPTION_*
 * Where the controller says where in the API the error
 * will originate and the field hints at what aspect of the
 * request caused the error (or $ for omission of field)
 */
const { validationResult } = require('express-validator');

const en = {
    'AUTH_USERNAME_NULL': 'A username is required.',
    'AUTH_USERNAME_SHORT': 'Username must be at least {0} chracters long.',
    'AUTH_USERNAME_NON_STRING': 'Username must be a string.',
    'AUTH_USERNAME_TAKEN': 'Username is already in use.',
    'AUTH_PASSWORD_NULL': 'A password is required.',
    'AUTH_PASSWORD_NON_STRING': 'Password must be a string.',
    'AUTH_PASSWORD_WEAK': 'Password is too weak.',
    'AUTH_$_INCORRECT_CREDENTIALS': 'Username or password is incorrect.',
};

const ja =  {
    'AUTH_USERNAME_NULL': 'ユーザー名が必要です。',
    'AUTH_USERNAME_SHORT': 'ユーザー名が{0}文字以上である必要があります。',
    'AUTH_USERNAME_NON_STRING': 'ユーザー名がストリングである必要があります。',
    'AUTH_USERNAME_TAKEN': 'そのユーザー名のユーザーが既に既存です。',
    'AUTH_PASSWORD_NULL': 'パスワードが必要です。',
    'AUTH_PASSWORD_NON_STRING': 'パスワードがストリングである必要があります。',
    'AUTH_PASSWORD_WEAK': 'パスワードが弱い過ぎます。',
    'AUTH_$_INCORRECT_CREDENTIALS': 'そのユーザー名、またはパスワードが間違っています。'
};

const sources = { ja, en };

/**
 * Create a response object based on an error
 * @param req
 * @param {String} errorName
 * @param {Array} args Format arguments
 * @returns { error: String, message: String }
 */
function createError(req, errorName, args) {
    const lang = req.acceptsLanguages('ja') ? 'ja' : 'en';
    return {
        error: errorName,
        message: format(sources[lang][errorName], args)
    };
}

/**
 * String formating function
 * Ex. format string: 'Showing {0} of {1} results.'
 * will result in string of `Showing {args[0]} of {args[1]} results.`
 * @param {String} str String to be formated
 * @param  {...any} args Arguments to format string with
 * @returns {String} The formated string
 */
function format(str, ...args) {
    return str.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
    });
}

/**
 * Create a function for creating errors with express validator
 * @param {String} errorName
 * @param {*} args Format arguments
 */
function createValidationHandler(errorName, args) {
    return (_, { req }) => {
        return createError(req, errorName, args);
    };
}

/**
 * Middleware to check for errors from express validator and responds with an
 * error code and object containing the errors if errors.
 */
 function collectErrors(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty())
        return next();

    res.status(400).json({ errors: 
        errors.array().map(err => err.msg)
    });
}

module.exports = {
    createValidationHandler,
    collectErrors,
    createError
};
