import { Router } from 'express';
import * as controller from '../controllers/lists';
import { body, query, oneOf } from 'express-validator';
import { isAuthorized } from '../middleware/authorization';
import { createValidationHandler, collectErrors } from '../middleware/errors';
import uuid from 'uuid';
import JMDict from '../jmdict';

const router = Router();

router.get('/', oneOf([
    query('id').exists().isMongoId(),
    [
        query('username').exists().isString(),
        query('title').exists().isString()
    ],
]), collectErrors, controller.getList);
router.delete('/:id', isAuthorized, controller.deleteList);
router.get('/mylists', isAuthorized, controller.getMyLists);
router.get('/:id/words', controller.getListWords);
router.put('/:id/words', [
    isAuthorized,
    body()
        .isArray()
        .withMessage('Body must be an array of word IDs')
        .bail()
        .custom((array: string[]) => array.reduce((previous, current) => previous && JMDict.isValidId(current), array.length > 0))
        .withMessage('Array must contain only valid word IDs'),
    collectErrors
], controller.addWordsToList);
router.delete('/:id/words', [
    isAuthorized,
    body()
        .isArray()
        .withMessage('Body must be an array of word IDs'),
    collectErrors
], controller.deleteWordsFromList);
//router.patch('/:id', controller.updateList);
router.post('/', [
    isAuthorized,
    body('title')
        .exists()
        .isString()
        .isLength({ min:  3 })
        .withMessage(createValidationHandler('LISTS_TITLE_SHORT')).bail()
        .isLength({ max: 30 })
        .withMessage(createValidationHandler('LISTS_TITLE_LONG')),
    body('slug')
        .customSanitizer((input) => input || uuid.v4())
        .isLength({ min:  3 })
        .withMessage(createValidationHandler('LISTS_SLUG_SHORT')).bail()
        .isLength({ max: 36 })
        .withMessage(createValidationHandler('LISTS_SLUG_LONG')),
    body('description')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage(createValidationHandler('LISTS_DESCRIPTION_LONG')),
    body('public')
        .default(true)
        .isBoolean(),
    collectErrors
], controller.postList);

export default router;
