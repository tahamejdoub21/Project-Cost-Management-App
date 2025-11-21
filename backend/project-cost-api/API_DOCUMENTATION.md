# Authentication & User Management API Documentation

Complete API documentation for the Project Cost Management authentication system with role-based access control and file upload capabilities.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except public endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Role-Based Access Control](#role-based-access-control)
4. [Error Handling](#error-handling)
5. [Request Examples](#request-examples)

---

## Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Description:** Register a new user account

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "position": "Software Engineer",
  "department": "Engineering"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Response (201 Created):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "avatar": null,
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Description:** Authenticate user and receive tokens

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "avatar": null,
    "isActive": true,
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Access:** Public

**Description:** Get new access token using refresh token

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

---

### 4. Logout

**Endpoint:** `POST /api/auth/logout`

**Access:** Protected (Authenticated users)

**Description:** Logout user and revoke refresh tokens

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Access:** Protected (Authenticated users)

**Description:** Change user password

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "message": "Password changed successfully. Please login again."
}
```

---

### 6. Get Profile

**Endpoint:** `GET /api/auth/profile`

**Access:** Protected (Authenticated users)

**Description:** Get detailed profile information

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "uploads/avatars/avatar-1234567890.jpg",
  "role": "USER",
  "isActive": true,
  "emailVerified": false,
  "lastLoginAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "profile": {
    "bio": "Experienced software engineer",
    "position": "Senior Developer",
    "department": "Engineering",
    "skills": ["JavaScript", "TypeScript", "NestJS"],
    "experience": 5,
    "hourlyRate": "150.00",
    "phone": "+1234567890",
    "location": "New York, USA",
    "website": "https://johndoe.com",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe"
    }
  },
  "userSettings": {
    "language": "en",
    "currency": "USD",
    "timezone": "UTC",
    "dateFormat": "YYYY-MM-DD",
    "theme": "light",
    "notifications": {
      "taskAssignments": true,
      "deadlineReminders": true,
      "projectUpdates": true,
      "teamMessages": true,
      "monthlyReports": false
    },
    "emailFrequency": "REALTIME"
  }
}
```

---

### 7. Get Current User

**Endpoint:** `GET /api/auth/me`

**Access:** Protected (Authenticated users)

**Description:** Get basic current user information

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "avatar": null,
  "isActive": true,
  "emailVerified": false
}
```

---

## User Management Endpoints

### 1. Create User (Admin)

**Endpoint:** `POST /api/users`

**Access:** Protected (SUPER_ADMIN, ADMIN, MANAGER)

**Description:** Create a new user (admin operation)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Jane Smith",
  "role": "USER",
  "isActive": true,
  "position": "Project Manager",
  "department": "Operations"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "USER",
  "avatar": null,
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "profile": {
    "position": "Project Manager",
    "department": "Operations"
  }
}
```

---

### 2. Get All Users

**Endpoint:** `GET /api/users`

**Access:** Protected (SUPER_ADMIN, ADMIN, MANAGER)

**Description:** Get paginated list of users with filtering

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (SUPER_ADMIN, ADMIN, MANAGER, USER, VIEWER)
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search by name or email

**Example:**

```
GET /api/users?page=1&limit=10&role=USER&isActive=true&search=john
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "role": "USER",
      "isActive": true,
      "emailVerified": false,
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "profile": {
        "position": "Software Engineer",
        "department": "Engineering",
        "phone": "+1234567890"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 3. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Access:** Protected (Authenticated users)

**Description:** Get detailed user information

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "uploads/avatars/avatar-123.jpg",
  "role": "USER",
  "isActive": true,
  "emailVerified": false,
  "lastLoginAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "profile": {
    "bio": "Experienced developer",
    "position": "Senior Developer",
    "department": "Engineering",
    "skills": ["JavaScript", "TypeScript"],
    "experience": 5,
    "hourlyRate": "150.00",
    "phone": "+1234567890",
    "location": "New York",
    "website": "https://example.com",
    "socialLinks": {}
  },
  "userSettings": {
    "language": "en",
    "currency": "USD",
    "timezone": "UTC",
    "dateFormat": "YYYY-MM-DD",
    "theme": "light",
    "emailFrequency": "REALTIME"
  },
  "_count": {
    "projects": 5,
    "tasks": 12,
    "teamMembers": 3
  }
}
```

---

### 4. Update User

**Endpoint:** `PATCH /api/users/:id`

**Access:** Protected (User can update own profile, Admins can update others)

**Description:** Update user information

**Request Body:**

```json
{
  "name": "John Updated",
  "position": "Lead Developer",
  "department": "Engineering",
  "bio": "Passionate about clean code",
  "phone": "+1234567890",
  "location": "San Francisco"
}
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Updated",
  "avatar": null,
  "role": "USER",
  "isActive": true,
  "emailVerified": false,
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "profile": {
    "position": "Lead Developer",
    "department": "Engineering",
    "bio": "Passionate about clean code",
    "phone": "+1234567890",
    "location": "San Francisco"
  }
}
```

---

### 5. Upload Profile Avatar

**Endpoint:** `POST /api/users/:id/avatar`

**Access:** Protected (User can upload own avatar, Admins can upload for others)

**Description:** Upload profile photo

**Content-Type:** `multipart/form-data`

**Form Data:**

- `avatar`: Image file (JPEG, PNG, WebP - Max 5MB)

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/users/user-id/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/image.jpg"
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "uploads/avatars/avatar-1705315800000-abc123.jpg",
  "role": "USER",
  "avatarUrl": "/uploads/avatars/avatar-1705315800000-abc123.jpg"
}
```

---

### 6. Delete Profile Avatar

**Endpoint:** `DELETE /api/users/:id/avatar`

**Access:** Protected (User can delete own avatar, Admins can delete for others)

**Description:** Remove profile photo

**Response (200 OK):**

```json
{
  "message": "Avatar deleted successfully"
}
```

---

### 7. Deactivate User

**Endpoint:** `PATCH /api/users/:id/deactivate`

**Access:** Protected (SUPER_ADMIN, ADMIN, MANAGER)

**Description:** Deactivate user account

**Response (200 OK):**

```json
{
  "message": "User deactivated successfully"
}
```

---

### 8. Activate User

**Endpoint:** `PATCH /api/users/:id/activate`

**Access:** Protected (SUPER_ADMIN, ADMIN, MANAGER)

**Description:** Activate user account

**Response (200 OK):**

```json
{
  "message": "User activated successfully"
}
```

---

### 9. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Access:** Protected (SUPER_ADMIN, ADMIN)

**Description:** Soft delete user (sets deletedAt timestamp)

**Response (200 OK):**

```json
{
  "message": "User deleted successfully"
}
```

---

## Role-Based Access Control

### User Roles Hierarchy

1. **SUPER_ADMIN** (Level 5) - Full system access
2. **ADMIN** (Level 4) - Manage users and system settings
3. **MANAGER** (Level 3) - Manage projects and teams
4. **USER** (Level 2) - Standard user access
5. **VIEWER** (Level 1) - Read-only access

### Role Permissions

#### SUPER_ADMIN
- All permissions
- Create/modify/delete any user
- Assign any role
- Full system control

#### ADMIN
- Create users with roles: MANAGER, USER, VIEWER
- Modify users below SUPER_ADMIN level
- Delete users below SUPER_ADMIN level
- Manage system resources

#### MANAGER
- Create users with roles: USER, VIEWER
- View all users
- Manage projects and teams
- Deactivate/activate users below MANAGER level

#### USER
- Update own profile
- Upload own avatar
- Change own password
- View accessible resources

#### VIEWER
- Read-only access
- Cannot modify any data

---

## Error Handling

### Standard Error Responses

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN, SUPER_ADMIN",
  "error": "Forbidden"
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User with ID abc123 not found",
  "error": "Not Found"
}
```

#### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## Request Examples

### Using cURL

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Profile

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Upload Avatar

```bash
curl -X POST http://localhost:3000/api/users/user-id/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/profile-photo.jpg"
```

### Using JavaScript (Fetch API)

#### Login

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
  }),
});

const data = await response.json();
console.log(data.accessToken);
```

#### Get Users (with Authentication)

```javascript
const response = await fetch('http://localhost:3000/api/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
console.log(data.data); // Array of users
```

---

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Authentication**: Access tokens (15min) and refresh tokens (7 days)
3. **Role-Based Access Control**: Hierarchical permission system
4. **Session Management**: Track user sessions with IP and user agent
5. **Audit Logging**: All authentication events logged
6. **File Upload Security**:
   - File type validation (JPEG, PNG, WebP only)
   - File size limits (5MB max)
   - Secure filename sanitization
7. **CORS Protection**: Configured allowed origins
8. **Input Validation**: Class-validator with strict rules
9. **Refresh Token Rotation**: New refresh token on each refresh
10. **Soft Delete**: User data preserved with deletedAt timestamp

---

## Static File Access

Uploaded files are accessible via:

```
http://localhost:3000/uploads/avatars/filename.jpg
```

Example:
```
http://localhost:3000/uploads/avatars/avatar-1705315800000-abc123.jpg
```

---

## Development Tips

1. **Access Token Expiry**: Access tokens expire in 15 minutes. Use refresh tokens to get new ones.
2. **Refresh Token Expiry**: Refresh tokens expire in 7 days. Users must re-login after expiry.
3. **Testing Roles**: Create users with different roles to test permissions.
4. **File Upload**: Ensure the `uploads/avatars` directory exists and has write permissions.
5. **Database**: All authentication data uses Prisma ORM with PostgreSQL.

---

## Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/project_cost_management"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/project_cost_management_shadow"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

---

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
