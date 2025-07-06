import * as userService from '../services/auth.service';
import * as jwtUtils from '../utils/jwt.util';
import { sendVerificationMail } from '../services/mail.service';
import { Request, Response } from 'express';

export async function registerUser(req: Request, res: Response): Promise<void>  {
    try {
        const {username, email, password} = req.body;

        const newUser = await userService.registerUser(username, email, password);
        if(!newUser || !newUser.verificationToken){
            res.status(500).json( {success: false, message: `Registration failed. No verification code sent` });
            return;
        }

        await sendVerificationMail(newUser.email, newUser?.verificationToken);

        res.status(201).json({
            success: true,
            message: `user has been successfully registered. Please verify first to login`
        });     
    } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
    }
}


export async function loginuser(req: Request, res: Response): Promise<void>  {
    try {  
        const { email, password } = req.body;
        if(!email || !password){
            res.status(500).json( {success: false, message: `Email and password are required` });
            return;
        }

        const currentUser = await userService.authenticateUser(email, password);
        if(!currentUser){
            res.status(500).json( {success: false, message: `Wrong credentials` });
            return;
        }

        if( currentUser.isVerified === false){
            res.status(500).json( {success: false, message: `Users Email not verified. Confirm email first to login` });
            return;
        }
        const token = await jwtUtils.generateToken(
            currentUser._id.toString(), currentUser.email, currentUser.role 
        );
        res.status(200).json({
            success: true,
            message: `user has been successfully loggedIn`,
            access_token: token
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
    }
}

//verify users mail
//take users email token
//if same token and email then email verified
//if already verified verification will fail
export async function verifyEmail(req: Request, res: Response): Promise<void>  {
    try {
        const { token, email } = req.body;
        if (!token || typeof token !== "string") {
            res.status(400).send({ success: false, message:"Token is required"});
            return;
        } 
        if (!email || typeof email !== "string") {
            res.status(400).send({ success: false, message:"email is required"});
            return;
        } 

        const user = await userService.verifyEmail(email, token);
        if(!user){
            res.status(500).send({ success: false, message: "Email couldnot be verified!"});
            return;
        }
        res.status(200).json({ success: true, message: "Email successfully verified!" });
    } catch (error: any) {
         res.status(500).json({ error: error.message });
        return;
    }
}

//new verification token will be sent if existing token expired 
//if expired then send new verification token
export async function resendVerificationEmail(req: Request, res: Response): Promise<void> {
  try {
    const {email}  = req.body;

    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const updatedUser = await userService.refreshVerificationToken(email);

    // Send mail
    await sendVerificationMail(updatedUser.email, updatedUser.verificationToken!);

    res.status(200).json({
      success: true,
      message: "Verification email has been resent"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}