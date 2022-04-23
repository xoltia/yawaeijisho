/* Base /api routes */
import { Router } from 'express';
import { baseController } from '../controllers';
import { query } from 'express-validator';
import config from '../config';
import { collectErrors } from '../middleware/errors';
import JMDict from '../jmdict';
import { optionalAuthorized } from '../middleware/authorization';

const router = Router();

router.get('/words', [
    query('id')
        .exists()
        .withMessage('Query must contain ID(s)')
        .bail()
        .customSanitizer(input => input.split(','))
        .custom((array: string[]) => array.reduce((previous, current) => previous && JMDict.isValidId(current), array.length > 0))
        .withMessage('Query must be a list of comma seperated JMDict IDs.'),
    collectErrors,
    optionalAuthorized
], baseController.getWordsByIds)
router.get('/words/:id', optionalAuthorized, baseController.getDefinitions)
router.get('/tags', baseController.getTags);
router.get('/count/:word', baseController.getWordCount);
router.get('/define/:word', optionalAuthorized, [
    query('page').isInt().default(0),
    query('size').isInt({ min: 1 }).default(config.maxPageSize)
], baseController.getDefinitions);
router.get('/kanji/:kanji', baseController.getKanji);
router.get('/wakachi/:phrase', baseController.wakachi);

export default router;
