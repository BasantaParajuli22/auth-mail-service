import transporter from "../utils/mail";

export async function sendVerificationMail(toEmail: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    transporter.sendMail({
        from:`"Book Reader" <${process.env.MAIL_USER}> `,
        to: toEmail,
        subject:"Verify your email",
        html:
        `<h2> Email verification from book reader app</h2>
         <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}"> ${verificationUrl} </a>`

    })
}