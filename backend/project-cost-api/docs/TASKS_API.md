# Tasks API Documentation

## Overview

The Tasks API provides comprehensive task management functionality for the Project Cost Management Application. It includes full CRUD operations, task assignment, status management, filtering, sorting, and pagination.

## Base URL

```
/api/tasks
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Task

Create a new task in a project.

**Endpoint:** `POST /tasks`

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT authentication to the API",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59Z",
  "estimatedHours": 8.5,
  "actualHours": 0,
  "progress": 0,
  "order": 1,
  "tags": ["backend", "api", "security"],
  "metadata": { "customField": "value" },
  "projectId": "uuid-of-project",
  "phaseId": "uuid-of-phase",
  "assigneeId": "uuid-of-user",
  "parentTaskId": "uuid-of-parent-task"
}
```

**Required Fields:**
- `title`: string - Task title
- `projectId`: string (UUID) - Project ID

**Optional Fields:**
- `description`: string - Task description
- `status`: enum - Task status (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED) - Default: TODO
- `priority`: enum - Task priority (LOW, MEDIUM, HIGH, URGENT) - Default: MEDIUM
- `dueDate`: string (ISO 8601) - Due date
- `estimatedHours`: number - Estimated hours to complete
- `actualHours`: number - Actual hours spent
- `progress`: number - Task progress percentage (0-100)
- `order`: number - Task order/position (auto-assigned if not provided)
- `tags`: string[] - Task tags
- `metadata`: object - Additional metadata
- `phaseId`: string (UUID) - Phase ID
- `assigneeId`: string (UUID) - Assigned user ID
- `parentTaskId`: string (UUID) - Parent task ID (for subtasks)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Implement user authentication",
  "description": "Add JWT authentication to the API",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "estimatedHours": 8.5,
  "actualHours": 0,
  "progress": 0,
  "order": 1,
  "tags": ["backend", "api", "security"],
  "metadata": { "customField": "value" },
  "projectId": "uuid-of-project",
  "phaseId": "uuid-of-phase",
  "assigneeId": "uuid-of-user",
  "creatorId": "uuid-of-creator",
  "parentTaskId": null,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z",
  "project": {
    "id": "uuid",
    "name": "Project Name",
    "code": "PROJ-001"
  },
  "phase": {
    "id": "uuid",
    "name": "Phase 1"
  },
  "assignee": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "creator": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatar": "https://..."
  },
  "parentTask": null,
  "subtasks": []
}
```

---

### 2. Get All Tasks (with Filtering & Pagination)

Retrieve tasks with advanced filtering, sorting, and pagination.

**Endpoint:** `GET /tasks`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `projectId` | UUID | Filter by project ID | `?projectId=uuid` |
| `phaseId` | UUID | Filter by phase ID | `?phaseId=uuid` |
| `assigneeId` | UUID | Filter by assignee ID | `?assigneeId=uuid` |
| `creatorId` | UUID | Filter by creator ID | `?creatorId=uuid` |
| `status` | enum | Filter by status (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED) | `?status=IN_PROGRESS` |
| `priority` | enum | Filter by priority (LOW, MEDIUM, HIGH, URGENT) | `?priority=HIGH` |
| `search` | string | Search in title and description | `?search=authentication` |
| `tag` | string | Filter by tag | `?tag=backend` |
| `dueDateFrom` | date | Filter tasks due after this date | `?dueDateFrom=2025-01-01` |
| `dueDateTo` | date | Filter tasks due before this date | `?dueDateTo=2025-12-31` |
| `unassigned` | boolean | Show only unassigned tasks | `?unassigned=true` |
| `parentOnly` | boolean | Show only parent tasks (no subtasks) | `?parentOnly=true` |
| `sortBy` | string | Sort by field (createdAt, updatedAt, dueDate, priority, status, order) | `?sortBy=dueDate` |
| `sortOrder` | string | Sort order (asc, desc) | `?sortOrder=asc` |
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=20` |

**Example Requests:**
```
GET /tasks?projectId=uuid&status=IN_PROGRESS&page=1&limit=10
GET /tasks?assigneeId=uuid&priority=HIGH&sortBy=dueDate&sortOrder=asc
GET /tasks?search=authentication&tag=backend
GET /tasks?unassigned=true&parentOnly=true
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-12-31T23:59:59.000Z",
      "estimatedHours": 8.5,
      "actualHours": 4.2,
      "progress": 50,
      "order": 1,
      "tags": ["backend", "api"],
      "metadata": {},
      "projectId": "uuid",
      "phaseId": "uuid",
      "assigneeId": "uuid",
      "creatorId": "uuid",
      "parentTaskId": null,
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T12:00:00.000Z",
      "project": { "id": "uuid", "name": "Project Name", "code": "PROJ-001" },
      "phase": { "id": "uuid", "name": "Phase 1" },
      "assignee": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "avatar": null },
      "creator": { "id": "uuid", "name": "Jane Smith", "email": "jane@example.com", "avatar": null },
      "parentTask": null,
      "subtasks": [
        { "id": "uuid", "title": "Subtask 1", "status": "DONE" }
      ],
      "_count": {
        "comments": 5,
        "attachments": 2,
        "timeEntries": 3
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 3. Get My Tasks

Get tasks assigned to the current user.

**Endpoint:** `GET /tasks/my-tasks`

**Query Parameters:**
- `status` (optional): Filter by task status

**Example Requests:**
```
GET /tasks/my-tasks
GET /tasks/my-tasks?status=IN_PROGRESS
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Task assigned to me",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "project": { "id": "uuid", "name": "Project Name", "code": "PROJ-001" },
    "phase": { "id": "uuid", "name": "Phase 1" },
    "creator": { "id": "uuid", "name": "Jane Smith", "email": "jane@example.com", "avatar": null },
    "_count": {
      "comments": 3,
      "attachments": 1,
      "subtasks": 2
    }
  }
]
```

---

### 4. Get Tasks by Project

Get all tasks for a specific project.

**Endpoint:** `GET /tasks/project/:projectId`

**Path Parameters:**
- `projectId`: string (UUID) - Project ID

**Example Request:**
```
GET /tasks/project/uuid-of-project
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Task Title",
    "status": "TODO",
    "priority": "MEDIUM",
    "order": 1,
    "phase": { "id": "uuid", "name": "Phase 1" },
    "assignee": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "avatar": null },
    "creator": { "id": "uuid", "name": "Jane Smith", "email": "jane@example.com", "avatar": null },
    "subtasks": [],
    "_count": {
      "comments": 0,
      "attachments": 0,
      "timeEntries": 0
    }
  }
]
```

---

### 5. Get Task by ID

Get detailed information about a specific task.

**Endpoint:** `GET /tasks/:id`

**Path Parameters:**
- `id`: string (UUID) - Task ID

**Example Request:**
```
GET /tasks/uuid-of-task
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Task Title",
  "description": "Detailed description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "estimatedHours": 8.5,
  "actualHours": 4.2,
  "progress": 50,
  "order": 1,
  "tags": ["backend", "api"],
  "metadata": {},
  "projectId": "uuid",
  "phaseId": "uuid",
  "assigneeId": "uuid",
  "creatorId": "uuid",
  "parentTaskId": null,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T12:00:00.000Z",
  "project": {
    "id": "uuid",
    "name": "Project Name",
    "code": "PROJ-001",
    "userId": "uuid",
    "teamMembers": []
  },
  "phase": { "id": "uuid", "name": "Phase 1" },
  "assignee": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "avatar": null },
  "creator": { "id": "uuid", "name": "Jane Smith", "email": "jane@example.com", "avatar": null },
  "parentTask": null,
  "subtasks": [
    {
      "id": "uuid",
      "title": "Subtask 1",
      "status": "DONE",
      "priority": "MEDIUM",
      "progress": 100,
      "assignee": { "id": "uuid", "name": "John Doe", "avatar": null }
    }
  ],
  "comments": [
    {
      "id": "uuid",
      "content": "Comment text",
      "createdAt": "2025-11-23T11:00:00.000Z",
      "user": { "id": "uuid", "name": "John Doe", "avatar": null }
    }
  ],
  "attachments": [
    {
      "id": "uuid",
      "name": "Document.pdf",
      "fileName": "document_123.pdf",
      "fileSize": 102400,
      "mimeType": "application/pdf",
      "createdAt": "2025-11-23T10:30:00.000Z"
    }
  ],
  "timeEntries": [
    {
      "id": "uuid",
      "duration": 2.5,
      "description": "Worked on implementation",
      "startTime": "2025-11-23T09:00:00.000Z",
      "endTime": "2025-11-23T11:30:00.000Z",
      "user": { "id": "uuid", "name": "John Doe" }
    }
  ],
  "_count": {
    "comments": 5,
    "attachments": 2,
    "timeEntries": 3,
    "subtasks": 1
  }
}
```

---

### 6. Update Task

Update an existing task.

**Endpoint:** `PATCH /tasks/:id`

**Path Parameters:**
- `id`: string (UUID) - Task ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "dueDate": "2025-12-31T23:59:59Z",
  "estimatedHours": 10,
  "actualHours": 5,
  "progress": 60,
  "order": 2,
  "tags": ["backend", "api", "urgent"],
  "metadata": { "updated": true },
  "phaseId": "uuid-of-phase",
  "assigneeId": "uuid-of-user",
  "parentTaskId": "uuid-of-parent-task"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "progress": 60,
  "project": { "id": "uuid", "name": "Project Name", "code": "PROJ-001" },
  "phase": { "id": "uuid", "name": "Phase 1" },
  "assignee": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "avatar": null },
  "creator": { "id": "uuid", "name": "Jane Smith", "email": "jane@example.com", "avatar": null },
  "parentTask": { "id": "uuid", "title": "Parent Task" },
  "subtasks": []
}
```

---

### 7. Delete Task

Delete a task. Only project owners, task creators, or team managers can delete tasks.

**Endpoint:** `DELETE /tasks/:id`

**Path Parameters:**
- `id`: string (UUID) - Task ID

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

---

### 8. Assign Task

Assign a task to a user.

**Endpoint:** `PATCH /tasks/:id/assign`

**Path Parameters:**
- `id`: string (UUID) - Task ID

**Request Body:**
```json
{
  "assigneeId": "uuid-of-user"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "assigneeId": "uuid-of-user",
  "assignee": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null
  }
}
```

---

### 9. Unassign Task

Remove the assignee from a task.

**Endpoint:** `PATCH /tasks/:id/unassign`

**Path Parameters:**
- `id`: string (UUID) - Task ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "assigneeId": null
}
```

---

### 10. Update Task Status

Update the status of a task.

**Endpoint:** `PATCH /tasks/:id/status`

**Path Parameters:**
- `id`: string (UUID) - Task ID

**Request Body:**
```json
{
  "status": "DONE"
}
```

**Valid Status Values:**
- `TODO`
- `IN_PROGRESS`
- `REVIEW`
- `DONE`
- `CANCELLED`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "DONE",
  "assignee": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "projectId must be a UUID"],
  "error": "Bad Request"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have access to this project",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Task with ID uuid not found",
  "error": "Not Found"
}
```

---

## Task Status Workflow

```
TODO → IN_PROGRESS → REVIEW → DONE
  ↓         ↓          ↓
CANCELLED ← ← ← ← ← ← ←
```

## Task Priority Levels

1. **LOW**: Minor tasks, no urgency
2. **MEDIUM**: Normal priority (default)
3. **HIGH**: Important tasks requiring attention
4. **URGENT**: Critical tasks requiring immediate action

---

## Access Control

### Task Creation
- Must be a project owner or team member

### Task Viewing
- Must be a project owner or team member

### Task Update
- Project owner, team member, or task assignee

### Task Deletion
- Project owner, task creator, or team manager/lead

### Task Assignment
- Project owner or team member

### Status Update
- Project owner, team member, or task assignee

---

## Examples

### Create a task with subtasks
```bash
# 1. Create parent task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement Authentication Module",
    "projectId": "project-uuid",
    "priority": "HIGH",
    "estimatedHours": 20
  }'

# 2. Create subtask
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setup JWT",
    "projectId": "project-uuid",
    "parentTaskId": "parent-task-uuid",
    "estimatedHours": 5
  }'
```

### Filter tasks by multiple criteria
```bash
curl -X GET "http://localhost:3000/api/tasks?projectId=uuid&status=IN_PROGRESS&priority=HIGH&sortBy=dueDate&sortOrder=asc&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### Assign and update task status
```bash
# Assign task
curl -X PATCH http://localhost:3000/api/tasks/<task-uuid>/assign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"assigneeId": "user-uuid"}'

# Update status
curl -X PATCH http://localhost:3000/api/tasks/<task-uuid>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

---

## Best Practices

1. **Use Parent Tasks for Complex Features**: Break down large features into parent tasks with subtasks
2. **Set Realistic Estimates**: Provide `estimatedHours` to help with project planning
3. **Use Tags for Organization**: Apply consistent tags for easy filtering
4. **Update Progress Regularly**: Keep the `progress` field updated
5. **Track Time**: Use time entries to monitor actual hours spent
6. **Use Metadata**: Store custom fields in the `metadata` object for extensibility

---

## Related APIs

- **Projects API**: Manage projects that contain tasks
- **Users API**: Manage users who can be assigned to tasks
- **Time Entries API**: Track time spent on tasks
- **Task Comments API**: Add comments to tasks
- **Task Attachments API**: Attach files to tasks
