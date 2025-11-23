# Mail Service Module

This module handles all email functionality for the Project Cost Management application using Brevo (formerly Sendinblue).

## Configuration

Add the following environment variables to your `.env` file:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Project Cost Management
FRONTEND_URL=http://localhost:4200
```

### Getting Brevo API Key

1. Sign up at [Brevo](https://www.brevo.com/)
2. Go to Settings → SMTP & API → API Keys
3. Create a new API key
4. Copy the key to your `.env` file
5. Verify your sender email address in Brevo dashboard

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

The service uses Brevo's (Sendinblue) official SDK:
- **Package**: `@getbrevo/brevo`
- **API**: Transactional Emails API
- **Authentication**: API key configuration
- **Features**: HTML emails, text fallback, sender customization

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

1. Set up your Brevo account and add API key to `.env`
2. Verify your sender email address in Brevo dashboard
3. Use Postman collection endpoints for registration and password reset
4. Check Brevo dashboard → Statistics → Transactional Emails for delivery status
5. **Development Mode**: Tokens ARE returned in API responses when `NODE_ENV !== 'production'`
   - `verificationToken` and `verificationUrl` included in registration/resend responses
   - `resetToken` and `resetUrl` included in password reset responses
6. **Production Mode**: Tokens are NOT returned in responses for security
7. Postman test scripts automatically capture and save tokens to environment variables

## Security Notes

- Verification tokens are 256-bit random hex strings
- Reset tokens expire after 1 hour
- Tokens are single-use only
- All tokens are stored hashed in the database
- Email tokens are NOT included in API responses
