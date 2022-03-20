/* Base /api routes */
import { Router } from 'express';
import * as controller from '../controllers';
import { query } from 'express-validator';
import config from '../config';
import { collectErrors } from '../middleware/errors';
import JMDict from '../jmdict';

const router = Router();

router.get('/words', [
    query('id')
        .exists()
        .withMessage('Query must contain ID(s)')
        .bail()
        .customSanitizer(input => input.split(','))
        .custom((array) => array.reduce((previous, current) => previous && JMDict.isValidId(current), array.length > 0))
        .withMessage('Query must be a list of comma seperated JMDict IDs.'),
    collectErrors
], controller.getMultipleByIds)
router.get('/words/:id', controller.getById)
router.get('/tags', controller.tags);
router.get('/count/:word', controller.count);
router.get('/define/:word', [
    query('page').isInt().default(0),
    query('size').isInt({ min: 1 }).default(config.maxPageSize)
], controller.define);
router.get('/wakachi/:phrase', controller.wakachi);

export default router;