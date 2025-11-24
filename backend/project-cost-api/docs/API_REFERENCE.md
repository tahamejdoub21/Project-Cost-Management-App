# API Reference - Quick Guide

## Base URL
```
http://localhost:3000
```

All endpoints require JWT authentication (except auth endpoints).
Include token in header: `Authorization: Bearer <token>`

---

## Time Entries

### Create Time Entry
```http
POST /time-entries
Content-Type: application/json

{
  "taskId": "uuid",
  "description": "Working on feature X",
  "startTime": "2025-01-23T09:00:00Z",
  "endTime": "2025-01-23T17:00:00Z",
  "billable": true
}
```

### Query Time Entries
```http
GET /time-entries?taskId=uuid&userId=uuid&startDate=2025-01-01&endDate=2025-01-31&billable=true
```

### Get Task Time Stats
```http
GET /time-entries/task/:taskId/stats
```

---

## Task Comments

### Create Comment
```http
POST /task-comments
Content-Type: application/json

{
  "content": "This looks great!",
  "taskId": "uuid",
  "parentId": "uuid"  // Optional, for replies
}
```

### Get Task Comments
```http
GET /task-comments/task/:taskId
```

---

## Task Attachments

### Create Attachment
```http
POST /task-attachments
Content-Type: application/json

{
  "name": "Design Mockup",
  "fileName": "mockup.png",
  "filePath": "/uploads/mockup.png",
  "fileSize": 1024000,
  "mimeType": "image/png",
  "description": "Initial design concept",
  "taskId": "uuid"
}
```

### Get Task Attachments
```http
GET /task-attachments/task/:taskId
```

---

## Discussions

### Create Discussion
```http
POST /discussions
Content-Type: application/json

{
  "title": "Sprint Planning",
  "content": "Let's discuss the next sprint goals",
  "projectId": "uuid"
}
```

### Get Project Discussions
```http
GET /discussions/project/:projectId
```

### Post Message
```http
POST /discussions/messages
Content-Type: application/json

{
  "content": "I agree with this approach",
  "discussionId": "uuid",
  "messageType": "TEXT"
}
```

### Mark Message as Read
```http
PATCH /discussions/messages/:messageId/read
```

---

## Notifications

### Get All Notifications
```http
GET /notifications
```

### Get Unread Notifications
```http
GET /notifications/unread
```

### Get Unread Count
```http
GET /notifications/unread/count
```

### Mark as Read
```http
PATCH /notifications/:id/read
```

### Mark All as Read
```http
PATCH /notifications/read-all
```

---

## Team Ratings

### Rate Team Member
```http
POST /team-ratings
Content-Type: application/json

{
  "ratedUserId": "uuid",
  "projectId": "uuid",
  "rating": 5,
  "comment": "Excellent team player",
  "skills": {
    "communication": 5,
    "technical": 4,
    "leadership": 5
  }
}
```

### Get User Ratings
```http
GET /team-ratings/user/:userId

Response:
{
  "ratings": [...],
  "stats": {
    "totalRatings": 10,
    "averageRating": 4.5
  }
}
```

---

## Cost Categories

### Create Category
```http
POST /cost-categories
Content-Type: application/json

{
  "name": "Software Licenses",
  "description": "All software and tool subscriptions",
  "color": "#FF5733",
  "icon": "license",
  "isActive": true
}
```

### List Categories
```http
GET /cost-categories
```

---

## Costs

### Create Cost
```http
POST /costs
Content-Type: application/json

{
  "title": "Adobe Creative Cloud",
  "description": "Annual subscription",
  "amount": 599.88,
  "quantity": 1,
  "unitPrice": 599.88,
  "currency": "USD",
  "categoryId": "uuid",
  "type": "EXPENSE",
  "status": "APPROVED",
  "dateIncurred": "2025-01-23",
  "dueDate": "2025-02-01",
  "projectId": "uuid",
  "phaseId": "uuid",
  "isRecurring": true,
  "recurrence": {
    "frequency": "monthly",
    "interval": 1
  }
}
```

### Query Costs
```http
GET /costs?projectId=uuid&categoryId=uuid&type=EXPENSE&status=APPROVED&startDate=2025-01-01&endDate=2025-12-31
```

### Get Project Cost Summary
```http
GET /costs/project/:projectId/summary

Response:
{
  "totalBudget": 100000,
  "actualCost": 45000,
  "remaining": 55000,
  "utilizationPercentage": 45,
  "totalCosts": 42,
  "byCategory": {
    "Software Licenses": { "total": 5000, "count": 3 },
    "Hardware": { "total": 10000, "count": 5 }
  },
  "byStatus": {
    "APPROVED": { "total": 30000, "count": 25 },
    "PAID": { "total": 15000, "count": 17 }
  }
}
```

---

## Cost Templates

### Create Template
```http
POST /cost-templates
Content-Type: application/json

{
  "name": "Monthly Server Costs",
  "description": "AWS EC2 instances",
  "amount": 500,
  "categoryId": "uuid",
  "metadata": {
    "provider": "AWS",
    "region": "us-east-1"
  }
}
```

---

## Project Attachments

### Create Project Attachment
```http
POST /project-attachments
Content-Type: application/json

{
  "name": "Project Charter",
  "fileName": "charter.pdf",
  "filePath": "/uploads/charter.pdf",
  "fileSize": 2048000,
  "mimeType": "application/pdf",
  "description": "Official project charter document",
  "projectId": "uuid"
}
```

### Get Project Attachments
```http
GET /project-attachments/project/:projectId
```

---

## User Profiles

### Get My Profile
```http
GET /user-profiles/me
```

### Get User Profile
```http
GET /user-profiles/:userId
```

### Update My Profile
```http
PATCH /user-profiles/me
Content-Type: application/json

{
  "bio": "Full-stack developer with 5 years experience",
  "position": "Senior Developer",
  "department": "Engineering",
  "skills": ["JavaScript", "TypeScript", "NestJS", "Angular"],
  "experience": 5,
  "hourlyRate": 75,
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "website": "https://example.com",
  "socialLinks": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username"
  }
}
```

---

## User Settings

### Get My Settings
```http
GET /user-settings/me
```

### Update My Settings
```http
PATCH /user-settings/me
Content-Type: application/json

{
  "language": "en",
  "currency": "USD",
  "timezone": "America/New_York",
  "dateFormat": "MM/DD/YYYY",
  "theme": "dark",
  "notifications": {
    "teamMessages": true,
    "monthlyReports": true,
    "projectUpdates": true,
    "taskAssignments": true,
    "deadlineReminders": true
  },
  "emailFrequency": "DAILY"
}
```

---

## Audit Logs (Admin Only)

### Query Audit Logs
```http
GET /audit-logs?entity=Project&entityId=uuid&userId=uuid&startDate=2025-01-01&endDate=2025-12-31
```

### Get Entity Audit Trail
```http
GET /audit-logs/Project/:projectId
```

---

## Common Response Formats

### Success Response
```json
{
  "id": "uuid",
  "createdAt": "2025-01-23T10:00:00Z",
  "updatedAt": "2025-01-23T10:00:00Z",
  ...
}
```

### Error Response
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

---

## Enums Reference

### UserRole
- `SUPER_ADMIN`
- `ADMIN`
- `MANAGER`
- `USER`
- `VIEWER`

### ProjectStatus
- `PLANNING`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`
- `ARCHIVED`

### TaskStatus
- `TODO`
- `IN_PROGRESS`
- `REVIEW`
- `DONE`
- `CANCELLED`

### TaskPriority
- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

### CostType
- `EXPENSE`
- `INCOME`
- `INVESTMENT`

### CostStatus
- `DRAFT`
- `PENDING`
- `APPROVED`
- `REJECTED`
- `PAID`
- `CANCELLED`

### MessageType
- `TEXT`
- `FILE`
- `SYSTEM`

### NotificationType
- `TASK_ASSIGNED`
- `TASK_UPDATED`
- `TASK_COMMENT`
- `PROJECT_INVITE`
- `PROJECT_UPDATE`
- `DEADLINE_REMINDER`
- `TEAM_MESSAGE`
- `SYSTEM`

### EmailFrequency
- `REALTIME`
- `DAILY`
- `WEEKLY`
- `NEVER`
