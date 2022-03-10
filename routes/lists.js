const router = require('express').Router();
const controller = require('../controllers/lists');
const { body, query, oneOf } = require('express-validator');
const { isAuthorized } = require('../middleware/authorization');
const { createValidationHandler, collectErrors } = require('../middleware/errors');
const { v4: uuidv4 } = require('uuid');
const jmdict = require('../jmdict');

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
        .custom((array) => array.reduce((previous, current) => previous && jmdict.isValidId(current), array.length > 0))
        .withMessage('Array must contain only valid word IDs'),
    collectErrors
], controller.addWordsToList);
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
], controller.postList);

module.exports = router;
