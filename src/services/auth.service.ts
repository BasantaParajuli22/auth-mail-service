import { generateRandomCode } from "../utils/random.utils";
import User from "../models/User";
import bcrypt from "bcrypt";

export async function registerUser(username: string, email: string, password: string, wantsEmail: boolean) {

    if(!email || !password){
        throw new Error('Email and password are required ');
    }
    const currentUser = await User.findOne({email}); 
    if(currentUser){ //if email exists error
        throw new Error('Email already exists ');
    }

    const verificationToken = generateRandomCode();
    const expires = new Date(Date.now() + 1000 * 60 * 15 );
            
    const role = "reader";
    const hashedpassword = await bcrypt.hash(password,10);

    const newUser = new User({
        username,
        email,
        password: hashedpassword, role,
        isVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: expires,
        wantsEmail: wantsEmail
    });
    const savedUser = await newUser.save();
    return savedUser;
}

//authenticate user to login
export async function authenticateUser(email: string, password: string) {               
    if(!email || !password){
        throw new Error('Email and password are required ');
    }

    const currentUser = await User.findOne({email}); 
    if(!currentUser){ //if email doesnot exists error
        throw new Error('User could not be found ');
    }

    const isPasswordCorrect = await bcrypt.compare(password, currentUser.password);
    if(!isPasswordCorrect){
        throw new Error( 'Wrong Credentials');
    }
    return currentUser;
}

export async function verifyEmail(email: string, token: string) {

    //find user by verification token 
    //if found change users isVerfied to true
    const user = await User.findOne({
        email: email,
        verificationToken: token,
        verificationTokenExpires:{ $gt: new Date()} //if expring time is greater than current time
    });
    if (!user){
        throw new Error('User not found or token has expired');
    } 
    if( user.isVerified){
        throw new Error('Users Email verified already!!!. You can login');
    }
  
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    await user.save();
    return user;
}

export async function refreshVerificationToken(email: string) {
    const user = await User.findOne( {email} );
    if( !user) {
    throw new Error('User not found ');
    }

    if( user.isVerified) {
        throw new Error('Users Email verified already!!!. You can login');
    }

    //token expiring date is 15 min+ while being created
    //tokenDate < current date  -> expired
    //tokenDate > current date  -> not expired
    if(user.verificationTokenExpires && user.verificationTokenExpires >= new Date()){
        throw new Error('Use existing verification token. It is usable for 15 min. ');
    }

    const newToken = generateRandomCode();
    const newExpires = new Date(Date.now() + 1000 * 60 * 15 );
    user.verificationToken = newToken;
    user.verificationTokenExpires = newExpires;

    await user.save();
    return user;
}

//for 2fa
export async function generateOtpCode(email: string) {
    const user = await User.findOne( {email} );
    if( !user) {
    throw new Error('User not found ');
    }

    //token expiring date is 15 min+ while being created
    //tokenDate < current date  -> expired
    //tokenDate > current date  -> not expired
    if(user.otpCodeExpires && user.otpCodeExpires >= new Date()){
        throw new Error('Use existing verification token. It is usable for 15 min. ');
    }

    const otpCode = generateRandomCode();
    const otpCodeExpires = new Date(Date.now() + 1000 * 60 * 15 );
    user.otpCode = otpCode;
    user.otpCodeExpires = otpCodeExpires;

    await user.save();
    return user;
}


//for 2fa
export async function verifyOtpCode(email: string, otpCode: string) {

    const user = await User.findOne({
        email: email,
        otpCode: otpCode,
        otpCodeExpires:{ $gt: new Date()} //if expring time is greater than current time
    });
    if (!user){
        throw new Error('User not found or token has expired');
    } 
    user.otpCode = undefined;
    user.otpCodeExpires = undefined;
    
    await user.save();
    return user;
}

//for password reset
export async function generateAndSavePasswordToken(email: string) {
    const user = await User.findOne( {email} );
    if( !user) {
        throw new Error('User not found ');
    }

    if(user.resetPasswordExpires && user.resetPasswordExpires >= new Date()){
        //log to display users activity
        console.log(`User trying to reset password, ${email} ${new Date()}`);
        throw new Error('Use existing verification token. It is usable for 15 min. ');
    }

    const passToken = generateRandomCode();
    const resetPassExpires = new Date(Date.now() + 1000 * 60 * 15 );

    user.resetPasswordToken = passToken;
    user.resetPasswordExpires = resetPassExpires;
    
    await user.save();
    return user;
}

export async function resetPassword( token: string, password: string) {
    //find user by reset PasswordToken 
    ////exp time is 15m + //if exp greater than date //token is not expired
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires:{ $gt: new Date()}  
    });

    if (!user){
        throw new Error('User not found or token has expired');
    } 

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return user;
}