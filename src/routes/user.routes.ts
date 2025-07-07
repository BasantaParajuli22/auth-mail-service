import express from 'express';
import * as userController from '../controllers/user.controller';

const userRouter = express.Router();

// Update user's email preference
userRouter.put('/users/:userId/email-preference', userController.updateEmailPreference);

// Admin: Send updates to subscribed users
userRouter.post('/users/:userId/send-updates', userController.sendUpdatesMail);

export default userRouter;
