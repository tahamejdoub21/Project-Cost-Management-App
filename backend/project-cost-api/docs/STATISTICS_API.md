# Statistics & Analytics API

Comprehensive statistics and analytics endpoints with advanced filtering capabilities for data insights and reporting.

## Overview

All statistics endpoints are protected by JWT authentication and automatically filtered based on user roles:
- **SUPER_ADMIN** and **ADMIN**: Access all data across the system
- **MANAGER**, **USER**, **VIEWER**: Access only projects they own or are team members of

## Endpoints

### 1. Dashboard Statistics
**GET** `/api/statistics/dashboard`

Get comprehensive dashboard overview with key metrics.

**Response includes:**
- Total and active projects count
- Task statistics (total, completed, overdue, my tasks)
- Cost summaries (total and pending amounts)
- Recent projects (last 5)
- Upcoming deadlines (next 7 days)

**Example:**
```bash
GET /api/statistics/dashboard
Authorization: Bearer {token}
```

---

### 2. Project Statistics
**GET** `/api/statistics/projects`

Get detailed project statistics with advanced filters.

**Query Parameters:**
- `startDate` (optional): Filter by creation start date (ISO 8601)
- `endDate` (optional): Filter by creation end date (ISO 8601)
- `status` (optional): Filter by status (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED, ARCHIVED)
- `userId` (optional, admin only): Filter by specific user
- `projectId` (optional): Get statistics for specific project

**Response includes:**
- Total project count
- Projects grouped by status
- Projects grouped by priority
- Budget analysis (total budget, actual cost, average progress)
- Top 10 projects by cost

**Example:**
```bash
GET /api/statistics/projects?status=ACTIVE&startDate=2024-01-01
Authorization: Bearer {token}
```

---

### 3. Cost Statistics
**GET** `/api/statistics/costs`

Get comprehensive cost analysis with multiple filter options.

**Query Parameters:**
- `startDate` (optional): Filter by date incurred start date
- `endDate` (optional): Filter by date incurred end date
- `projectId` (optional): Filter by specific project
- `type` (optional): Filter by cost type (EXPENSE, INCOME, INVESTMENT)
- `status` (optional): Filter by status (DRAFT, PENDING, APPROVED, REJECTED, PAID, CANCELLED)
- `categoryId` (optional): Filter by cost category
- `phaseId` (optional): Filter by project phase

**Response includes:**
- Total cost count
- Costs grouped by type with amounts
- Costs grouped by status with amounts
- Costs grouped by category with names and colors
- Cost summary (total and average amounts)
- Top 10 highest costs

**Example:**
```bash
GET /api/statistics/costs?type=EXPENSE&status=PAID&projectId={id}
Authorization: Bearer {token}
```

---

### 4. Task Statistics
**GET** `/api/statistics/tasks`

Get task analytics with completion rates and time tracking.

**Query Parameters:**
- `startDate` (optional): Filter by creation start date
- `endDate` (optional): Filter by creation end date
- `projectId` (optional): Filter by specific project
- `status` (optional): Filter by status (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
- `assigneeId` (optional): Filter by assignee
- `phaseId` (optional): Filter by project phase

**Response includes:**
- Total task count
- Tasks grouped by status
- Tasks grouped by priority
- Tasks grouped by assignee
- Time tracking summary (estimated vs actual hours)
- Completion rate percentage
- Overdue tasks count

**Example:**
```bash
GET /api/statistics/tasks?status=IN_PROGRESS&assigneeId={userId}
Authorization: Bearer {token}
```

---

### 5. Team Statistics
**GET** `/api/statistics/team`

Get team member statistics and performance ratings.

**Query Parameters:**
- `projectId` (optional): Filter by specific project
- `userId` (optional): Filter by specific user

**Response includes:**
- Total and active member counts
- Members grouped by role
- Detailed member list with user and project info
- Average ratings per team member

**Example:**
```bash
GET /api/statistics/team?projectId={id}
Authorization: Bearer {token}
```

---

### 6. Time Tracking Statistics
**GET** `/api/statistics/time`

Get time entry analytics with billable/non-billable breakdowns.

**Query Parameters:**
- `startDate` (optional): Filter by start time start date
- `endDate` (optional): Filter by start time end date
- `projectId` (optional): Filter by specific project
- `userId` (optional): Filter by specific user
- `taskId` (optional): Filter by specific task

**Response includes:**
- Total time entry count
- Time summary (total hours, average, billable vs non-billable)
- Hours grouped by user
- Recent 20 time entries

**Example:**
```bash
GET /api/statistics/time?projectId={id}&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

---

## Common Features

### Role-Based Access Control
All endpoints automatically filter data based on user permissions:
- Regular users see only their projects and teams
- Admins can access all data and use `userId` filters

### Date Filtering
All date filters accept ISO 8601 format:
- `YYYY-MM-DD` (e.g., "2024-01-01")
- `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., "2024-01-01T00:00:00.000Z")

### Response Format
All responses return JSON with structured data:
```json
{
  "total": 0,
  "summary": {},
  "byStatus": [],
  "byPriority": [],
  "topItems": []
}
```

## Usage in Postman

The updated Postman collection (v4.0.0) includes all statistics endpoints under the "Statistics & Analytics" folder with:
- Pre-configured query parameters
- Detailed descriptions for each filter
- Example values
- Response samples

Import the collection and use the `{{accessToken}}` and `{{projectId}}` variables for testing.

## Performance Notes

- All endpoints use efficient database aggregations
- Queries are optimized with proper indexes
- Large result sets are limited (e.g., top 10, recent 20)
- Role-based filtering is applied at the database level

## Best Practices

1. **Use date ranges**: Always specify date ranges for large datasets
2. **Combine filters**: Use multiple filters for precise analytics
3. **Cache results**: Dashboard stats can be cached for 5-10 minutes
4. **Project-specific**: Use `projectId` filter for project-level dashboards
5. **Monitor performance**: Add pagination if datasets grow too large
