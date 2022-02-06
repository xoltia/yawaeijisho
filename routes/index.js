/* Base /api routes */

const router = require('express').Router();
const controller = require('../controllers');
const { query } = require('express-validator');
const { maxPageSize } = require('../config');

router.get('/tags', controller.tags);
router.get('/count/:word', controller.count);
router.get('/define/:word', [
    query('page').isInt().default(0),
    query('size').isInt({ min: 1 }).default(maxPageSize)
], controller.define);
router.get('/wakachi/:phrase', controller.wakachi);

module.exports = router;
