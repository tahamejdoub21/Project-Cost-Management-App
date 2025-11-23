# Email Verification & Password Reset Flow

## Overview

The authentication system now includes complete email functionality using MailAPI.dev, with special development mode support for easy testing.

## Email Flows

### 1. Registration & Email Verification

```
User registers → API creates account → Sends verification email
                     ↓
        Returns tokens (dev mode only)
                     ↓
User clicks email link → Email verified → Welcome email sent
```

**Registration Response (Development):**
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "accessToken": "...",
  "refreshToken": "...",
  "sessionToken": "...",
  "message": "Registration successful! Please check your email to verify your account.",
  "verificationToken": "abc123...",
  "verificationUrl": "http://localhost:4200/verify-email?token=abc123..."
}
```

**Registration Response (Production):**
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "accessToken": "...",
  "refreshToken": "...",
  "sessionToken": "...",
  "message": "Registration successful! Please check your email to verify your account."
}
```

### 2. Password Reset Flow

```
User requests reset → API generates token → Sends reset email
                          ↓
          Returns token (dev mode only)
                          ↓
User clicks email link → Submits new password → Confirmation email sent
```

**Password Reset Request Response (Development):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent",
  "resetToken": "xyz789...",
  "resetUrl": "http://localhost:4200/reset-password?token=xyz789..."
}
```

**Password Reset Request Response (Production):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

## Testing with Postman

### Step 1: Register a New User

1. Open Postman and select **"Register - Full Profile"** or **"Register - Minimal"**
2. Update the email in the request body to use your test email
3. Send the request
4. **In Development**: Token is automatically saved to `{{verificationToken}}`
5. **In Production**: Check your email for the verification link

### Step 2: Verify Email

1. Select **"Verify Email"** request
2. The token should already be in the request body: `{{verificationToken}}`
3. Send the request
4. User receives welcome email

### Step 3: Test Password Reset

1. Select **"Request Password Reset"** request
2. Update email in request body
3. Send the request
4. **In Development**: Token is automatically saved to `{{resetToken}}`
5. **In Production**: Check your email for the reset link

### Step 4: Complete Password Reset

1. Select **"Reset Password"** request
2. Token should already be in request body: `{{resetToken}}`
3. Update `newPassword` field
4. Send the request
5. User receives password changed confirmation email

### Step 5: Resend Verification (if needed)

1. Select **"Resend Verification Email"** request
2. Update email in request body
3. Send the request
4. **In Development**: New token automatically saved
5. **In Production**: Check email for new verification link

## Email Templates

All emails are professional HTML templates with:
- Responsive design
- Branded colors (green, orange, blue, purple)
- Security warnings where appropriate
- Clickable buttons with fallback URLs
- Professional footer

### Email Types:

1. **Verification Email** (Green #4CAF50)
2. **Password Reset** (Orange #FF9800) - Includes 1-hour expiration warning
3. **Password Changed** (Blue #2196F3) - Security confirmation
4. **Welcome Email** (Purple #673AB7) - Sent after successful verification

## Environment Variables

Required in `.env`:

```env
NODE_ENV="development"                              # Set to "production" to hide tokens
MAILAPI_API_KEY="mapi_..."                         # Your MailAPI.dev API key
MAILAPI_FROM_EMAIL="noreply@mail.mailapi.dev"      # Sender email
MAILAPI_FROM_NAME="Project Cost Management"        # Sender name
FRONTEND_URL="http://localhost:4200"               # Frontend URL for email links
```

## Security Features

✅ **Token Security**
- 256-bit random tokens (crypto.randomBytes)
- Single-use tokens (cleared after use)
- Time-limited reset tokens (1 hour expiration)
- Tokens sent only via email in production

✅ **Email Security**
- All tokens hashed in database
- Password reset revokes all refresh tokens
- Email verification required for account activation
- Confirmation emails for password changes

✅ **Development vs Production**
- Development: Tokens in response for easy testing
- Production: Tokens only sent via email
- Same email functionality in both environments

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | Public | Register and send verification email |
| `/auth/verify-email` | POST | Public | Verify email with token |
| `/auth/resend-verification` | POST | Public | Resend verification email |
| `/auth/request-password-reset` | POST | Public | Request password reset email |
| `/auth/reset-password` | POST | Public | Reset password with token |
| `/auth/change-password` | POST | JWT | Change password (logged in) |

## Troubleshooting

**Q: I'm not receiving emails**
- Check MailAPI.dev dashboard for delivery status
- Verify MAILAPI_API_KEY is correct
- Check spam/junk folder
- Ensure email address is valid

**Q: Tokens not showing in Postman response**
- Verify `NODE_ENV="development"` in .env file
- Restart the NestJS server after changing .env
- Check that ConfigModule is loading environment variables

**Q: Token expired or invalid**
- Password reset tokens expire after 1 hour
- Verification tokens are single-use
- Request a new token using resend endpoints

**Q: Welcome email not sent**
- Welcome email only sent after successful email verification
- Check MailAPI.dev dashboard for delivery status

## Next Steps for Production

Before deploying to production:

1. Set `NODE_ENV="production"` in production environment
2. Update `FRONTEND_URL` to production domain
3. Configure proper email domain (not mailapi.dev subdomain)
4. Test all email flows in production environment
5. Monitor MailAPI.dev dashboard for email delivery
6. Set up email delivery notifications/webhooks if needed
