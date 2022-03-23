/**
 * Error names are in the following format
 * CONTROLLER_FIELD_DESCRIPTION_*
 * Where the controller says where in the API the error
 * will originate and the field hints at what aspect of the
 * request caused the error (or $ for omission of field)
 */
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';

type ErrorName =
    '$_$_CLIENT_ERROR' |

    'AUTH_USERNAME_NULL' | 'AUTH_USERNAME_SHORT' |  'AUTH_USERNAME_LONG' |
    'AUTH_USERNAME_NON_STRING'| 'AUTH_USERNAME_TAKEN' | 'AUTH_PASSWORD_NULL' |
    'AUTH_PASSWORD_NON_STRING' | 'AUTH_PASSWORD_WEAK' | 'AUTH_$_INCORRECT_CREDENTIALS' |

    'LISTS_TITLE_SHORT' | 'LISTS_TITLE_LONG' | 'LISTS_SLUG_SHORT' | 'LISTS_SLUG_LONG' |
    'LISTS_SLUG_NOT_UNIQUE' | 'LISTS_DESCRIPTION_LONG';

type Locale = 'ja' | 'en';
type ErrorSource = Record<ErrorName, string>;
type ErrorSources = Record<Locale, ErrorSource>;

interface APIError {
    error: ErrorName,
    message: string
}

const en: ErrorSource = {
    '$_$_CLIENT_ERROR': 'An unexpected error has occured.',
    'AUTH_USERNAME_NULL': 'A username is required.',
    'AUTH_USERNAME_SHORT': 'Username must be at least {0} chracters long.',
    'AUTH_USERNAME_LONG': 'Username must be at most {0} chracters long.',
    'AUTH_USERNAME_NON_STRING': 'Username must be a string.',
    'AUTH_USERNAME_TAKEN': 'Username is already in use.',
    'AUTH_PASSWORD_NULL': 'A password is required.',
    'AUTH_PASSWORD_NON_STRING': 'Password must be a string.',
    'AUTH_PASSWORD_WEAK': 'Password is too weak.',
    'AUTH_$_INCORRECT_CREDENTIALS': 'Username or password is incorrect.',
    'LISTS_TITLE_SHORT': 'Title is too short.',
    'LISTS_TITLE_LONG': 'Title is too long.',
    'LISTS_SLUG_SHORT': 'Slug is too short.',
    'LISTS_SLUG_LONG': 'Slug is too long.',
    'LISTS_SLUG_NOT_UNIQUE': 'Slugs must be unique.',
    'LISTS_DESCRIPTION_LONG': 'Description is too long.',
};

const ja: ErrorSource = {
    '$_$_CLIENT_ERROR': '予想外のエラーが発生しました。',
    'AUTH_USERNAME_NULL': 'ユーザー名が必要です。',
    'AUTH_USERNAME_SHORT': 'ユーザー名が{0}文字以上である必要があります。',
    'AUTH_USERNAME_LONG': 'ユーザー名が{0}文字以下である必要があります。',
    'AUTH_USERNAME_NON_STRING': 'ユーザー名がストリングである必要があります。',
    'AUTH_USERNAME_TAKEN': 'そのユーザー名が既に使われています。',
    'AUTH_PASSWORD_NULL': 'パスワードが必要です。',
    'AUTH_PASSWORD_NON_STRING': 'パスワードがストリングである必要があります。',
    'AUTH_PASSWORD_WEAK': 'パスワードが弱すぎます。',
    'AUTH_$_INCORRECT_CREDENTIALS': 'そのユーザー名、またはパスワードが間違っています。',
    'LISTS_TITLE_SHORT': '標記が短すぎます。',
    'LISTS_TITLE_LONG': '標記が長すぎます。',
    'LISTS_SLUG_SHORT': 'スラッグが短すぎます。',
    'LISTS_SLUG_LONG': 'スラッグが長すぎます。',
    'LISTS_SLUG_NOT_UNIQUE': 'ご利用のアカウントでそのスラッグが既に使われています。',
    'LISTS_DESCRIPTION_LONG': '説明が長い過ぎます。',
};

const sources: ErrorSources = { ja, en };

/**
 * Create a response object based on an error
 */
function createError(req: Request, errorName: ErrorName, ...args: any[]): APIError {
    const lang = req.acceptsLanguages('ja') ? 'ja' : 'en';
    return {
        error: errorName,
        message: format(sources[lang][errorName] || '', args)
    };
}

/**
 * String formating function
 * Ex. format string: 'Showing {0} of {1} results.'
 * will result in string of `Showing {args[0]} of {args[1]} results.`
 * @param {String} str String to be formated
 * @param  {Array<any>} args Arguments to format string with
 * @returns {String} The formated string
 */
function format(str: String, ...args: any[]): string {
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
 * @param {Array<any>} args Format arguments
 */
function createValidationHandler(errorName: ErrorName, ...args: any[]): (any, { req: Request }) => APIError {
    return (_, { req }: { req: Request }) => {
        return createError(req, errorName, args);
    };
}

/**
 * Middleware to check for errors from express validator and responds with an
 * error code and object containing the errors if errors.
 */
 function collectErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (errors.isEmpty())
        return next();
        
    res.status(400).json({
        // If error message is default express-validator error then
        // the error was not caused by user input
        errors: errors.array().map(err => err.msg.error ? err.msg : {
            ...createError(req, '$_$_CLIENT_ERROR', null, null),
            details: err
        }),
    });
}

export {
    createValidationHandler,
    collectErrors,
    createError
};
