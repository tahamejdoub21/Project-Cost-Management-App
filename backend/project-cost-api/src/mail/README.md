# Mail Service Module

This module handles all email functionality for the Project Cost Management application using MailAPI.dev.

## Configuration

Add the following environment variables to your `.env` file:

```env
MAILAPI_API_KEY=your_api_key_here
MAILAPI_FROM_EMAIL=noreply@mail.mailapi.dev
MAILAPI_FROM_NAME=Project Cost Management
FRONTEND_URL=http://localhost:4200
```

## Features

The mail service provides the following email templates:

### 1. Email Verification
- **Template**: Professional HTML email with verification button
- **Sent when**: User registers for a new account
- **Contains**: Verification link with token that expires when used
- **Template color**: Green (#4CAF50)

### 2. Password Reset Request
- **Template**: Professional HTML email with password reset button
- **Sent when**: User requests a password reset
- **Contains**: Reset link with token that expires in 1 hour
- **Template color**: Orange (#FF9800)
- **Security**: Includes expiration warning

### 3. Password Changed Confirmation
- **Template**: Professional HTML email confirming password change
- **Sent when**: User successfully resets password OR changes password via settings
- **Contains**: Security warning if user didn't make the change
- **Template color**: Blue (#2196F3)

### 4. Welcome Email
- **Template**: Professional HTML email welcoming new users
- **Sent when**: User successfully verifies their email
- **Contains**: Welcome message and next steps
- **Template color**: Purple (#673AB7)

## Email Flow

### Registration Flow
1. User registers → Verification email sent → User clicks link → Welcome email sent

### Password Reset Flow
1. User requests reset → Reset email sent → User clicks link and sets new password → Confirmation email sent

### Password Change Flow
1. User changes password in settings → Confirmation email sent

## API Integration

The service uses MailAPI.dev's REST API:
- **Endpoint**: `https://api.mailapi.dev/v1/email/send`
- **Authentication**: API key via `X-API-Key` header
- **Content-Type**: `application/json`

## Error Handling

The mail service includes robust error handling:
- Logs all email sending attempts
- Continues execution even if email fails (non-blocking)
- Returns boolean success status
- Includes fallback plain text generation from HTML

## Usage in Services

```typescript
import { MailService } from '../mail/mail.service';

@Injectable()
export class YourService {
  constructor(private mailService: MailService) {}

  async someMethod() {
    await this.mailService.sendVerificationEmail(
      'user@example.com',
      'John Doe',
      'verification-token-here'
    );
  }
}
```

## Testing

To test email sending:

1. Use Postman collection endpoints for registration and password reset
2. Check MailAPI.dev dashboard for sent emails
3. **Development Mode**: Tokens ARE returned in API responses when `NODE_ENV !== 'production'`
   - `verificationToken` and `verificationUrl` included in registration/resend responses
   - `resetToken` and `resetUrl` included in password reset responses
4. **Production Mode**: Tokens are NOT returned in responses for security
5. Postman test scripts automatically capture and save tokens to environment variables

## Security Notes

- Verification tokens are 256-bit random hex strings
- Reset tokens expire after 1 hour
- Tokens are single-use only
- All tokens are stored hashed in the database
- Email tokens are NOT included in API responses
