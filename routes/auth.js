const router = require('express').Router();
const controller = require('../controllers/auth');
const { body } = require('express-validator');
const { collectErrors, createValidationHandler } = require('../middleware/errors');

router.post('/signup', [
    body('username')
        .exists().withMessage(createValidationHandler('AUTH_USERNAME_NULL')).bail()
        .isString().withMessage(createValidationHandler('AUTH_USERNAME_NON_STRING')).bail()
        .isLength({ min: 3 }).withMessage(createValidationHandler('AUTH_USERNAME_SHORT', 3))
        .isLength({ max: 15 }).withMessage(createValidationHandler('AUTH_USERNAME_SHORT', 15)),
    body('password')
        .exists().withMessage(createValidationHandler('AUTH_PASSWORD_NULL')).bail()
        .isString().withMessage(createValidationHandler('AUTH_PASSWORD_NON_STRING')).bail()
        .isStrongPassword().withMessage(createValidationHandler('AUTH_PASSWORD_WEAK')),
    collectErrors
], controller.signUp);
router.post('/signin', [
    body('username')
        .exists({ checkFalsy: true }).withMessage(createValidationHandler('AUTH_USERNAME_NULL')).bail()
        .isString().withMessage(createValidationHandler('AUTH_USERNAME_NON_STRING')),
    body('password')
        .exists({ checkFalsy: true }).withMessage(createValidationHandler('AUTH_PASSWORD_NULL')).bail()
        .isString().withMessage(createValidationHandler('AUTH_PASSWORD_NON_STRING')),
    collectErrors
], controller.signIn);

module.exports = router;
