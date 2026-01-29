# Resend Email Setup Guide

## Steps to Get Resend API Key

1. **Sign up for Resend**
   - Go to [https://resend.com/signup](https://resend.com/signup)
   - Create a free account (100 emails/day free)

2. **Get API Key**
   - After login, go to **API Keys** section
   - Click "Create API Key"
   - Give it a name (e.g., "K-Forum Production")
   - Copy the API key (starts with `re_`)

3. **Update Environment Variables**
   - In your server `.env` file: `RESEND_API_KEY=re_your_api_key_here`
   - In Render dashboard: Add `RESEND_API_KEY` environment variable

4. **Verify Domain (Optional - For Custom Email)**
   - For production, verify your domain in Resend
   - Update `from` email in `auth.js` from `onboarding@resend.dev` to `noreply@yourdomain.com`
   - For testing, `onboarding@resend.dev` works fine

## Testing Locally

```bash
cd server
npm install
# Add RESEND_API_KEY to .env
npm run dev
```

## Important Notes

- **Free Tier**: 100 emails/day, 1 email/second
- **Default From Email**: `onboarding@resend.dev` (for testing)
- **Custom Domain**: Verify your domain for branded emails
- Better deliverability than Gmail SMTP
- Simple API, no complex SMTP configuration

## Update in Production (Render)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add new environment variable:
   - Key: `RESEND_API_KEY`
   - Value: `re_your_api_key`
5. Click "Save Changes" - service will auto-deploy

## Migration Complete! ✅

Replaced nodemailer with Resend API:
- ✅ Registration emails
- ✅ Email verification (OTP)
- ✅ Password reset emails
- ✅ Simpler configuration
- ✅ Better deliverability
