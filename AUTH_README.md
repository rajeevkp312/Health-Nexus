# HealthNexus Authentication System

## Overview
A comprehensive authentication system for HealthNexus with email verification, role-based access, and password recovery features.

## Features

### 🔐 **Authentication Features**
- **Login System**: Role-based login for patients and doctors
- **Patient Registration**: Complete registration with email verification
- **Email Verification**: 6-digit OTP system for account verification
- **Forgot Password**: Password reset with OTP verification
- **Remember Me**: Extended session duration option
- **JWT Tokens**: Secure token-based authentication

### 🎨 **UI/UX Features**
- **Light Mode Design**: Clean, modern interface similar to appointment booking
- **Mobile Responsive**: Optimized for all screen sizes
- **Real-time Validation**: Instant feedback on form inputs
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Comprehensive error messages and validation

### 🛡️ **Security Features**
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **OTP Expiration**: 10-minute expiry for security codes
- **Email Verification**: Mandatory email verification for new accounts
- **Role-based Access**: Separate access for patients and doctors

## Installation

### Backend Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken nodemailer
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/healthnexus7
```

### Gmail Setup for Email
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register a new patient account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "age": 30,
  "gender": "Male",
  "bloodGroup": "O+",
  "address": "123 Main St"
}
```

#### POST `/verify-otp`
Verify OTP and complete registration
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "userData": { /* registration data */ }
}
```

#### POST `/login`
Login with email and password
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "rememberMe": true
}
```

#### POST `/forgot-password`
Request password reset OTP
```json
{
  "email": "john@example.com"
}
```

#### POST `/reset-password`
Reset password with OTP
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

## Database Models

### User Model
- Unified model for both patients and doctors
- Role-based field requirements
- Password hashing with bcryptjs
- Email verification status

### OTP Model
- Email verification codes
- Password reset codes
- Automatic expiration (10 minutes)
- Usage tracking

## Frontend Components

### AuthModal Component
- **Location**: `frontend/src/components/AuthModal.jsx`
- **Features**: Login, Registration, OTP verification, Password reset
- **Styling**: Light mode design matching appointment form
- **Responsive**: Mobile-optimized layout

### Usage Example
```jsx
import { AuthModal } from '../components/AuthModal';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  return (
    <AuthModal 
      isOpen={isAuthOpen} 
      onClose={() => setIsAuthOpen(false)} 
    />
  );
}
```

## Authentication Flow

### Registration Flow
1. User fills registration form
2. System sends OTP to email
3. User enters OTP for verification
4. Account created and user logged in
5. JWT token stored in localStorage

### Login Flow
1. User enters email, password, and role
2. System validates credentials
3. JWT token generated and returned
4. Token stored in localStorage
5. User redirected based on role

### Password Reset Flow
1. User enters email address
2. System sends OTP to email
3. User enters OTP and new password
4. Password updated in database
5. User can login with new password

## Security Considerations

### Password Security
- Minimum 6 characters required
- Hashed using bcryptjs with salt rounds
- Never stored in plain text

### JWT Security
- Signed with secret key
- Contains user ID, email, and role
- Configurable expiration time
- Remember me extends to 30 days

### Email Security
- OTP codes are 6 digits
- 10-minute expiration time
- One-time use only
- Secure email templates

## Error Handling

### Common Error Responses
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (user doesn't exist)
- `500`: Internal Server Error

### Frontend Error Handling
- Toast notifications for user feedback
- Form validation with visual indicators
- Network error handling
- Loading states during API calls

## Integration with Existing System

### Backward Compatibility
- Existing patient and doctor models preserved
- New User model for authentication
- Migration scripts can be created if needed

### Role-based Access
- Patients: Access to appointments, medical records
- Doctors: Access to patient management, schedules
- Admins: Full system access (existing admin system)

## Testing

### Manual Testing Checklist
- [ ] Patient registration with email verification
- [ ] Doctor and patient login
- [ ] Password reset functionality
- [ ] Remember me functionality
- [ ] Form validation and error handling
- [ ] Mobile responsiveness
- [ ] Email delivery and OTP verification

### Email Testing
- Use a real Gmail account for testing
- Check spam folder for OTP emails
- Verify email templates render correctly
- Test OTP expiration (10 minutes)

## Troubleshooting

### Common Issues

#### Email Not Sending
- Check Gmail credentials in .env
- Verify App Password is correct
- Check if 2FA is enabled
- Review nodemailer configuration

#### JWT Errors
- Verify JWT_SECRET in .env
- Check token format in requests
- Ensure token hasn't expired

#### Database Connection
- Verify MongoDB is running
- Check connection string
- Ensure models are properly imported

#### CORS Issues
- Verify frontend URL in CORS config
- Check request headers
- Ensure proper API endpoints

## Future Enhancements

### Planned Features
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Account lockout after failed attempts
- [ ] Email templates customization
- [ ] Password strength requirements
- [ ] Session management dashboard

### Performance Optimizations
- [ ] Redis for OTP storage
- [ ] Rate limiting for API endpoints
- [ ] Email queue system
- [ ] Token refresh mechanism

## Support

For issues or questions regarding the authentication system:
1. Check this README for common solutions
2. Review error logs in browser console
3. Verify environment variables are set correctly
4. Test with a fresh database if needed

---

**Note**: This authentication system is designed to work alongside the existing HealthNexus admin system without breaking any existing functionality.
