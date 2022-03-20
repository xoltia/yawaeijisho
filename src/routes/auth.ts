import { Router } from 'express';
import * as controller from '../controllers/auth';
import { body } from 'express-validator';
import { createValidationHandler, collectErrors } from '../middleware/errors';

const router = Router();

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

export default router;
