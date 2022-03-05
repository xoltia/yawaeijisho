/* Base /api routes */
const router = require('express').Router();
const controller = require('../controllers');
const { query } = require('express-validator');
const { maxPageSize } = require('../config');
const { collectErrors } = require('../middleware/errors');
const jmdict = require('../jmdict');

router.get('/words', [
    query('id')
        .exists()
        .withMessage('Query must contain ID(s)')
        .bail()
        .customSanitizer(input => input.split(','))
        .custom((array) => array.reduce((previous, current) => previous && jmdict.isValidId(current), array.length > 0))
        .withMessage('Query must be a list of comma seperated JMDict IDs.'),
    collectErrors
], controller.getMultipleByIds)
router.get('/words/:id', controller.getById)
router.get('/tags', controller.tags);
router.get('/count/:word', controller.count);
router.get('/define/:word', [
    query('page').isInt().default(0),
    query('size').isInt({ min: 1 }).default(maxPageSize)
], controller.define);
router.get('/wakachi/:phrase', controller.wakachi);

module.exports = router;
