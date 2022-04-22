import { Router } from 'express';
import { body } from 'express-validator';
import { funcController } from '../controllers';
import { isAuthorized } from '../middleware/authorization';
import { collectErrors, createValidationHandler } from '../middleware/errors';

const router = Router();

router.get('/myfuncs', [
    isAuthorized,
], funcController.getCurrentUserFuncs);

router.get('/:id', [
    isAuthorized
], funcController.getFuncById);

router.post('/', [
    isAuthorized,
    body('name')
        .exists()
        .isString()
        .isLength({ min: 3 })
        .withMessage(createValidationHandler('FUNCS_NAME_TOO_SHORT'))
        .isLength({ max: 30 })
        .withMessage(createValidationHandler('FUNCS_NAME_TOO_LONG')),
    body('script')
        .exists()
        .isString()
        .isLength({ max: 2000 })
        .withMessage(createValidationHandler('FUNCS_SCRIPT_TOO_LONG')),
    collectErrors,
], funcController.postFunc);

router.patch('/:id', [
    isAuthorized,
    body('name')
        .optional()
        .isString()
        .isLength({ min: 3 })
        .withMessage(createValidationHandler('FUNCS_NAME_TOO_SHORT'))
        .isLength({ max: 30 })
        .withMessage(createValidationHandler('FUNCS_NAME_TOO_LONG')),
    body('script')
        .optional()
        .isString()
        .isLength({ max: 2000 })
        .withMessage(createValidationHandler('FUNCS_SCRIPT_TOO_LONG')),
    collectErrors,
], funcController.updateFunc);

export default router;
