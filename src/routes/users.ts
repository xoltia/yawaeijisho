import { Router } from 'express';
import { isAuthorized, isUser } from '../middleware/authorization';
import { me, exists } from '../controllers/users';

const router = Router();

router.get('/me', [
    isAuthorized,
    isUser
], me);

router.get('/exists/:username', exists);

export default router;
