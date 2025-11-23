# Brevo (Sendinblue) Email Integration Setup Guide

This guide will help you set up Brevo for sending transactional emails in your Project Cost Management application.

## What is Brevo?

Brevo (formerly Sendinblue) is a powerful email marketing and transactional email service that provides:
- **Free tier**: 300 emails/day
- **Reliable delivery**: High deliverability rates
- **Easy setup**: Simple API integration
- **Email templates**: Professional HTML email support
- **Analytics**: Track email opens, clicks, and bounces

## Step-by-Step Setup

### 1. Create a Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click "Sign up free"
3. Fill in your details and create your account
4. Verify your email address

### 2. Get Your API Key

1. Log in to your Brevo dashboard
2. Click on your profile icon (top right)
3. Select **"SMTP & API"**
4. Navigate to **"API Keys"** tab
5. Click **"Generate a new API key"**
6. Give it a name (e.g., "Project Cost Management - Dev")
7. Copy the API key (you won't be able to see it again!)

### 3. Verify Your Sender Email

**Important**: Brevo requires sender email verification before you can send emails.

1. In Brevo dashboard, go to **"Senders, Domains & Dedicated IPs"** → **"Senders"**
2. Click **"Add a new sender"**
3. Enter your sender email (e.g., `noreply@yourdomain.com`)
4. Enter sender name (e.g., "Project Cost Management")
5. Check your email inbox and click the verification link
6. Wait for approval (usually instant for common email providers)

**For Development**: You can use your personal email as the sender initially.

### 4. Configure Environment Variables

Update your `.env` file with your Brevo credentials:

```env
# Brevo (Sendinblue) Configuration
BREVO_API_KEY="xkeysib-your-actual-api-key-here"
BREVO_FROM_EMAIL="noreply@yourdomain.com"  # Must be verified
BREVO_FROM_NAME="Project Cost Management"
```

**Example**:
```env
BREVO_API_KEY="xkeysib-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567"
BREVO_FROM_EMAIL="noreply@projectcost.com"
BREVO_FROM_NAME="Project Cost Management"
```

### 5. Restart Your Server

After updating the `.env` file:

```bash
# If running in development
npm run start:dev

# The console should show:
# [MailService] Brevo (Sendinblue) initialized successfully
```

## Email Templates

The application includes 4 professional HTML email templates:

### 1. **Email Verification** (Green Theme)
- Sent when user registers
- Contains verification link
- Expires: Never (but single-use)

### 2. **Welcome Email** (Purple Theme)
- Sent after email verification
- Welcome message and next steps

### 3. **Password Reset** (Orange Theme)
- Sent when user requests password reset
- Contains reset link
- Expires: 1 hour

### 4. **Password Changed Confirmation** (Blue Theme)
- Sent after password change/reset
- Security notification

## Testing Email Sending

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'

# Request password reset
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com"
  }'
```

### Using Postman

1. Import the Postman collection from `postman_collection.json`
2. Set environment variable `baseUrl` to `http://localhost:3000/api`
3. Test endpoints:
   - **Register** - Full Profile
   - **Request Password Reset**
   - **Verify Email** (use token from registration response)
   - **Reset Password** (use token from reset request)

## Checking Email Delivery

1. Log in to Brevo dashboard
2. Go to **"Statistics"** → **"Transactional Emails"**
3. View sent emails, delivery status, and metrics
4. Check spam folder if emails don't arrive

## Common Issues & Solutions

### Issue: "Brevo not configured - check API key and from email"

**Solution**:
- Verify `BREVO_API_KEY` is set correctly in `.env`
- Ensure no extra spaces or quotes
- Restart your server after changing `.env`

### Issue: Emails not being delivered

**Solutions**:
1. Check Brevo dashboard → Statistics for delivery status
2. Verify sender email is confirmed in Brevo
3. Check recipient spam/junk folder
4. Ensure you haven't exceeded daily limit (300 emails/day on free plan)

### Issue: "Sender not verified" error

**Solution**:
- Go to Brevo dashboard → Senders
- Click the verification link sent to your sender email
- Wait for approval (usually instant)

### Issue: API key not working

**Solutions**:
- Generate a new API key in Brevo dashboard
- Make sure you're using v3 API key (starts with `xkeysib-`)
- Check API key permissions

## Email Flow Logic

### Registration & Verification Flow

```
User registers
    ↓
✉️ Verification email sent
    ↓
User clicks email link
    ↓
Email verified
    ↓
✉️ Welcome email sent
```

### Forgot Password Flow

```
User requests password reset
    ↓
✉️ Reset email sent (1-hour expiration)
    ↓
User clicks email link
    ↓
User sets new password
    ↓
All sessions revoked
    ↓
✉️ Confirmation email sent
```

### Change Password Flow

```
User changes password (logged in)
    ↓
Password updated
    ↓
All sessions revoked
    ↓
✉️ Confirmation email sent
```

## Development vs Production

### Development Mode (`NODE_ENV=development`)
- Tokens returned in API responses for easy testing
- Verification and reset URLs included
- Detailed logging

### Production Mode (`NODE_ENV=production`)
- Tokens NOT in responses (security)
- Only sends emails
- Minimal logging

## Monitoring & Analytics

Brevo provides detailed analytics:

1. **Email Status**:
   - Sent
   - Delivered
   - Opened
   - Clicked
   - Bounced
   - Marked as spam

2. **Metrics**:
   - Delivery rate
   - Open rate
   - Click rate
   - Bounce rate

3. **Logs**:
   - Real-time email logs
   - Error tracking
   - SMTP logs

## Upgrading Plan

Free plan limitations:
- 300 emails/day
- Brevo logo in emails
- Basic support

To upgrade:
1. Go to Brevo dashboard → **"Plans"**
2. Choose a paid plan based on volume
3. Remove Brevo branding
4. Get priority support

## Best Practices

1. **Sender Reputation**:
   - Use a verified domain email
   - Avoid spammy content
   - Monitor bounce rates

2. **Email Content**:
   - Keep HTML clean and responsive
   - Include text version
   - Add unsubscribe link (for marketing emails)

3. **Security**:
   - Never commit API keys to git
   - Use environment variables
   - Rotate API keys periodically

4. **Testing**:
   - Test in development before production
   - Check all email templates
   - Verify links work correctly

## Support & Resources

- **Brevo Documentation**: https://developers.brevo.com/
- **API Reference**: https://developers.brevo.com/reference
- **Brevo Support**: support@brevo.com
- **Community**: https://community.brevo.com/

## Troubleshooting Commands

```bash
# Check if server is running
curl http://localhost:3000/api

# View server logs
npm run start:dev

# Test email configuration
# (Check console for "Brevo initialized successfully")

# Verify environment variables
cat .env | grep BREVO
```

## Next Steps

1. ✅ Set up Brevo account
2. ✅ Get API key
3. ✅ Verify sender email
4. ✅ Update `.env` file
5. ✅ Test registration email
6. ✅ Test password reset email
7. ✅ Check Brevo dashboard
8. ✅ Monitor delivery rates

## Need Help?

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review Brevo dashboard for error messages
3. Check application logs for errors
4. Verify all configuration steps were completed
5. Contact Brevo support if needed

---

**Ready to send emails!** 🚀

Once configured, your application will automatically send professional, branded emails for all authentication flows.
