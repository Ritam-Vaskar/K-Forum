import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const emailService = {
  /**
   * Send verification OTP email
   */
  async sendVerificationEmail(email, otp) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'K-Forum <onboarding@resend.dev>',
        to: email,
        subject: 'K-Forum Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #17d059;">Welcome to K-Forum!</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #17d059; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        `
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error };
    }
  },

  /**
   * Send re-verification OTP email (for login)
   */
  async sendReVerificationEmail(email, otp) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'K-Forum <onboarding@resend.dev>',
        to: email,
        subject: 'K-Forum Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #17d059;">Email Verification Required</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #17d059; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>Please verify your email to access your account.</p>
          </div>
        `
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending re-verification email:', error);
      return { success: false, error };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, otp) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'K-Forum <onboarding@resend.dev>',
        to: email,
        subject: 'K-Forum Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #17d059;">Password Reset Request</h2>
            <p>Your password reset code is:</p>
            <h1 style="color: #17d059; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
          </div>
        `
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }
  }
};

export default emailService;
