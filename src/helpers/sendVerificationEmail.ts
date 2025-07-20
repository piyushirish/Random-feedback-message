import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: email,
        subject: 'Random feedback | Verification code',
        react: VerificationEmail({username, otp: verifyCode}),
    });
        return {success: true, message: 'verification email send successfully'}
    } catch (emailerror) {
        console.log("error sending verification email", emailerror)
        return {success: false, message: 'failed to send verification email'}
    }
}