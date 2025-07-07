import User from "../models/User";
import transporter from "../utils/mail";
import { generateRandomCode } from "../utils/random.utils";

export async function sendVerificationMail(toEmail: string, token: string) {
    const verificationUrl = `${process.env.BACKEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
        from:`"Book Reader" <${process.env.MAIL_USER}> `,
        to: toEmail,
        subject:"Verify your email",
         html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`

    };
     try {
         await transporter.sendMail(mailOptions);
    } catch (error: any) {
         throw new Error('Error while sending update mail');
    }
}

//takes userEmail and token 
export async function sendPasswordResetMail(toEmail: string, token: string) {
    const verificationUrl = `${process.env.BACKEND_URL}/password-reset?token=${token}`;
    const mailOptions = {
        from:`"Book Reader" <${process.env.MAIL_USER}> `,
        to: toEmail,
        subject:"Password Reset ",
         html: `<p>Please click this link to reset your password
          <a href="${verificationUrl}">here</a> to verify your email.</p>`

    };
     try {
         await transporter.sendMail(mailOptions);
    } catch (error: any) {
         throw new Error('Error while sending update mail');
    }
}

export async function sendPasswordResetConfirmation(toEmail: string) {
    const mailOptions = {
        from:`"Book Reader" <${process.env.MAIL_USER}> `,
        to: toEmail,
        subject:"Your Password was changed",
         html: `<p>Your password has been successfully reset.
          If you didn't do this, contact support immediately.</p>`
    };
     try {
         await transporter.sendMail(mailOptions);
    } catch (error: any) {
         throw new Error('Error while sending password reset confirmation mail');
    }
}

export async function sendOtpCode(toEmail: string, otpCode: string) {
    const newToken = generateRandomCode();

    const mailOptions = {
        from:`"Book Reader" <${process.env.MAIL_USER}> `,
        to: toEmail,
        subject:"Your Otp Code has been sent",
        html: `<p>Your OTP code is ${otpCode}.</p>`
    };
     try {
        await transporter.sendMail(mailOptions);
    } catch (error: any) {
        throw new Error('Error while sending otp code mail');
    }
}



export async function sendUpdatesMailToUsers(updateHeader: string, updateMessage: string) {

    //get users who has accepted to email updates
    //get those users email & username only
    const users = await User.find( {wantsEmails: true}, "email username");
    // const emailList = users.map(user => user.email);

    for (const user of users) {
        const mailOptions = {
            from: `"Book Reader" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: ` Update: ${updateHeader}!`,

            html: `<h2> ${updateHeader}</h2>
                <p>Hi,${user.username}</p><p>We just rolled out new updates...</p>
                <p>${updateMessage}</p>`
        };

        try {  
            await transporter.sendMail(mailOptions);
            console.log("update mail has been sent");
        } catch (error: any) {
            throw new Error('Error while sending update mail');
        }
    }
}