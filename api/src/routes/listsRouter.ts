import { Router } from 'express';
import { listsController } from '../controllers';
import { body, query, oneOf } from 'express-validator';
import { isAuthorized } from '../middleware/authorization';
import { createValidationHandler, collectErrors } from '../middleware/errors';
import { v4 as uuidv4 } from 'uuid';
import JMDict from '../jmdict';

const router = Router();

router.get('/', oneOf([
    query('id').exists().isMongoId(),
    [
        query('username').exists().isString(),
        query('title').exists().isString()
    ],
]), collectErrors, listsController.getListByQuery);
router.delete('/:id', isAuthorized, listsController.deleteList);
router.get('/mylists', isAuthorized, listsController.getCurrentUserLists);
router.get('/:id/words', listsController.getListWords);
router.put('/:id/words', [
    isAuthorized,
    body()
        .isArray()
        .withMessage('Body must be an array of word IDs')
        .bail()
        .custom((array: string[]) => array.reduce((previous, current) => previous && JMDict.isValidId(current), array.length > 0))
        .withMessage('Array must contain only valid word IDs'),
    collectErrors
], listsController.addWordsToList);
router.delete('/:id/words', [
    isAuthorized,
    body()
        .isArray()
        .withMessage('Body must be an array of word IDs'),
    collectErrors
], listsController.deleteWordsFromList);
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
        .customSanitizer((input) => input || uuidv4())
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
], listsController.createList);

export default router;
