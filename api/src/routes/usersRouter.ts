import { Router } from 'express';
import { isAuthorized, isUser } from '../middleware/authorization';
import { usersController } from '../controllers';

const router = Router();

router.get('/me', [
    isAuthorized,
    isUser
], usersController.getCurrentUser);

router.get('/exists/:username', usersController.userExists);

export default router;
