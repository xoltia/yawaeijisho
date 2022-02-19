const router = require('express').Router();
const { isAuthorized, isUser } = require('../middleware/authorization');
const controller = require('../controllers/users');

router.get('/me', [
    isAuthorized,
    isUser
], controller.me);

router.get('/exists/:username', controller.exists);

module.exports = router;
