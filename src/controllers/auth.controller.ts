import { Request, Response } from 'express';
import * as jwtUtils from '../utils/jwt.util';
import * as userService from '../services/auth.service';
import * as mailService from '../services/mail.service';


//register user using email and password
//generates email verification token 
//sends mail to user for email verification
export async function registerUser(req: Request, res: Response): Promise<void>  {
    try {
        const {username, email, password, wantsEmail= true} = req.body;

        //register and generate email verification token
        const newUser = await userService.registerUser(username, email, password, wantsEmail);
        if(!newUser || !newUser.verificationToken){
            res.status(500).json( {success: false, message: `Registration failed. No verification code sent` });
            return;
        }

        //send mail
        await mailService.sendVerificationMail(newUser.email, newUser?.verificationToken);
        res.status(201).json({
            success: true,
            message: `user has been successfully registered. Please verify first to login`
        });     
    } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
    }
}

//1 step login
//verify email and pass
//fails if email is not verified even if email pass is correct
//if email veirified then generates jwt token
export async function loginuser(req: Request, res: Response): Promise<void>  {
    try {  
        const { email, password } = req.body;
        if(!email || !password){
            res.status(500).json( {success: false, message: `Email and password are required` });
            return;
        }

        //verify email and password
        const currentUser = await userService.authenticateUser(email, password);
        if(!currentUser){
            res.status(500).json( {success: false, message: `Wrong credentials` });
            return;
        }

        if( currentUser.isVerified === false){
            res.status(500).json( {success: false, message: `Users Email not verified. Confirm email first to login` });
            return;
        }
        //generate jwt token
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

//2FA login -> 1st phase
//verify email and pass
//send otp code to email
export async function TwoFALogin(req: Request, res: Response): Promise<void>  {
    try {  
        const { email, password } = req.body;
        if(!email || !password){
            res.status(500).json( {success: false, message: `Email and password are required` });
            return;
        }

        //verify email and password
        const currentUser = await userService.authenticateUser(email, password);
        if(!currentUser){
            res.status(500).json( {success: false, message: `Wrong credentials` });
            return;
        }
        if( currentUser.isVerified === false){
            res.status(500).json( {success: false, message: `Users Email not verified. Confirm email first to login` });
            return;
        }

        //same as normal login up until now
        //but now we generate otp code and save it
        const user = await userService.generateOtpCode(currentUser.email);
        if(!user || !user.otpCode){
            res.status(500).json( {success: false, message: `Fail to send otp code to user` });
            return;
        }

        //send code through users email 
        await mailService.sendOtpCode(currentUser.email, user.otpCode);

        res.status(200).json({
            success: true,
            message: `2FA login initiated.u can login after entering otpcode.`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
    }
}

//2FA -> 2nd phase
//user checks email box
//verify otpcode 
//if matches generate jwt token to login 
export async function verifyOtpCodeAndLogin(req: Request, res: Response): Promise<void>  {
    try {
        const { otpCode, email } = req.body;
        if (!otpCode || typeof otpCode !== "string") {
            res.status(400).send({ success: false, message:"Token is required"});
            return;
        } 
        if (!email || typeof email !== "string") {
            res.status(400).send({ success: false, message:"email is required"});
            return;
        } 

        const currentUser = await userService.verifyOtpCode(email, otpCode);
        if(!currentUser){
            res.status(500).send({ success: false, message: "Email couldnot be verified!"});
            return;
        }
        //generate jwt token
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
//take users email n token
//if same token and email as stored on db then email will be verified
//if already verified verification will fail
//email verification needs to be done first before login 
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
//and stores verification token & expiration
export async function resendVerificationEmail(req: Request, res: Response): Promise<void> {
  try {
    const {email}  = req.body;

    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const updatedUser = await userService.refreshVerificationToken(email);

    // Send mail
    await mailService.sendVerificationMail(updatedUser.email, updatedUser.verificationToken!);

    res.status(200).json({
      success: true,
      message: "Verification email has been resent"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//check users email exists if exists then send email 
export async function sendPasswordResetMail(req: Request, res: Response): Promise<void> {
  try {
    const {email}  = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    //generate token 
    //save token to requested users mail
    const user = await userService.generateAndSavePasswordToken(email);
    if(!user || !user.resetPasswordToken){
      res.status(500).send({ success: false, message: "Email couldnot be verified!"});
      return;
    }

    // Send mail
    await mailService.sendPasswordResetMail(user.email, user.resetPasswordToken);

    res.status(200).json({
      success: true,
      message: " Password Reset Mail email has been sent"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//resets password using passwordReset token and new password
//saves new password 
//sends confirmation email that password was changed 
export async function resetPassword(req: Request, res: Response): Promise<void>  {
    try {
        const { token, password  } = req.body;
        if (!token || !password) {
            res.status(400).send({ success: false, message:"Token and password is required"});
            return;
        } 
        //verify token and reset password
        const user = await userService.resetPassword( token, password);
        if(!user){
            res.status(500).send({ success: false, message: "Email couldnot be verified!"});
            return;
        }
        await mailService.sendPasswordResetConfirmation(user.email);
        res.status(200).json({ success: true, message: "Email successfully verified!" });
    } catch (error: any) {
         res.status(500).json({ error: error.message });
        return;
    }
}