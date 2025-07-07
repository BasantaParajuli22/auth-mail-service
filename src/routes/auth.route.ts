import express from 'express';
import * as authController from '../controllers/auth.controller';

const authRouter = express.Router();

// Register and verify
authRouter.post('/auth/register', authController.registerUser);
authRouter.post('/auth/verify', authController.verifyEmail);
authRouter.post('/auth/resend', authController.resendVerificationEmail);

// Login
authRouter.post('/auth/login', authController.loginuser);

// 2FA login
authRouter.post('/auth/2fa-login', authController.TwoFALogin);
authRouter.post('/auth/2fa-verify', authController.verifyOtpCodeAndLogin);

// Password reset
authRouter.post('/auth/reset-mail', authController.sendPasswordResetMail);
authRouter.post('/auth/reset-password', authController.resetPassword);

export default authRouter;
