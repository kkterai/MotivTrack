# MotivTrack API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "email": "parent@example.com",
  "password": "password123",
  "role": "admin_parent",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "parent@example.com",
      "role": "admin_parent",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "parent@example.com",
  "password": "password123"
}
```

### Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

### Update Password
**PUT** `/auth/password`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

---

## Task Endpoints

### Create Task
**POST** `/tasks`

**Headers:** `Authorization: Bearer <token>` (Admin Parent only)

**Body:**
```json
{
  "childProfileId": "uuid",
  "title": "Make bed",
  "doneStandard": "Duvet up and flat, pillows in place",
  "extraWellDoneStandard": "Sheets tucked in, pillows arranged",
  "tips": "Pull the sheet tight before doing the duvet",
  "pointsDone": 1,
  "pointsExtraWellDone": 2,
  "libraryTaskId": "uuid" // optional
}
```

### Get Tasks for Child
**GET** `/tasks/child/:childProfileId?activeOnly=true`

**Headers:** `Authorization: Bearer <token>`

### Get Task by ID
**GET** `/tasks/:id`

**Headers:** `Authorization: Bearer <token>`

### Update Task
**PUT** `/tasks/:id`

**Headers:** `Authorization: Bearer <token>` (Admin Parent only)

**Body:**
```json
{
  "title": "Updated title",
  "pointsDone": 2
}
```

### Get Task Statistics
**GET** `/tasks/child/:childProfileId/stats`

**Headers:** `Authorization: Bearer <token>`

---

## Claim Endpoints (The "Aha! Loop")

### Create Claim (Child marks task complete)
**POST** `/claims`

**Headers:** `Authorization: Bearer <token>` (Child only)

**Body:**
```json
{
  "taskId": "uuid",
  "childProfileId": "uuid",
  "claimType": "done" // or "extra_well_done"
}
```

### Verify Claim (Parent approves/requests redo)
**PUT** `/claims/:id/verify`

**Headers:** `Authorization: Bearer <token>` (Parent only)

**Body:**
```json
{
  "status": "verified", // or "redo_requested"
  "redoNote": "Please wipe down the counter too" // optional
}
```

### Get Pending Claims for Parent
**GET** `/claims/pending`

**Headers:** `Authorization: Bearer <token>` (Parent only)

### Get Claims for Child
**GET** `/claims/child/:childProfileId?status=pending`

**Headers:** `Authorization: Bearer <token>`

---

## Point Endpoints

### Get Point Balance
**GET** `/points/child/:childProfileId/balance`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 42
  }
}
```

### Get Point History
**GET** `/points/child/:childProfileId/history?limit=50`

**Headers:** `Authorization: Bearer <token>`

### Get Point Metrics
**GET** `/points/child/:childProfileId/metrics`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPoints": 42,
    "pointsThisWeek": 15,
    "pointsThisMonth": 35,
    "pointsBySource": {
      "task_claim": 30,
      "streak_bonus": 10,
      "welcome_bonus": 2
    },
    "recentTransactions": [...]
  }
}
```

---

## Reward Endpoints

### Create Reward
**POST** `/rewards`

**Headers:** `Authorization: Bearer <token>` (Admin Parent only)

**Body:**
```json
{
  "childProfileId": "uuid",
  "title": "Ice cream trip",
  "description": "Trip to favorite ice cream shop",
  "pointCost": 10
}
```

### Get Rewards for Child
**GET** `/rewards/child/:childProfileId?activeOnly=true`

**Headers:** `Authorization: Bearer <token>`

### Update Reward
**PUT** `/rewards/:id`

**Headers:** `Authorization: Bearer <token>` (Admin Parent only)

**Body:**
```json
{
  "title": "Updated title",
  "pointCost": 15,
  "isActive": true
}
```

### Redeem Reward (Child earns it)
**POST** `/rewards/:id/redeem`

**Headers:** `Authorization: Bearer <token>` (Child only)

### Get Pending Redemptions
**GET** `/rewards/redemptions/pending`

**Headers:** `Authorization: Bearer <token>` (Parent only)

### Mark Reward as Delivered
**PUT** `/rewards/redemptions/:id/deliver`

**Headers:** `Authorization: Bearer <token>` (Parent only)

### Calculate RDT Metric
**GET** `/rewards/metrics/rdt`

**Headers:** `Authorization: Bearer <token>` (Parent only)

**Response:**
```json
{
  "success": true,
  "data": {
    "rdt": {
      "averageDays": 3.5,
      "totalRedemptions": 10,
      "period": "30 days",
      "meetsTarget": true
    }
  }
}
```

---

## Library Endpoints

### Browse Library Tasks
**GET** `/library?category=kitchen`

**Headers:** `Authorization: Bearer <token>`

### Get Library Task by ID
**GET** `/library/:id`

**Headers:** `Authorization: Bearer <token>`

### Seed Library (Development only)
**POST** `/library/seed`

**Headers:** `Authorization: Bearer <token>`

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications?limit=50&unreadOnly=true`

**Headers:** `Authorization: Bearer <token>`

### Mark Notification as Opened
**PUT** `/notifications/:id/open`

**Headers:** `Authorization: Bearer <token>`

### Calculate NER Metric
**GET** `/notifications/metrics/ner`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "ner": 72.5
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Role-Based Access Control

**Roles:**
- `admin_parent` - Full control over family tasks, rewards, and settings
- `delivery_parent` - Can deliver rewards, view tasks
- `child` - Can claim tasks, redeem rewards
- `teacher` - Can submit behavior ratings (Phase 2)

**Middleware:**
- `authenticate` - Verifies JWT token
- `requireRole(role)` - Requires specific role
- `requireParent` - Requires admin_parent OR delivery_parent
- `requireAdminParent` - Requires admin_parent only
- `requireChild` - Requires child role
- `requireTeacher` - Requires teacher role

---

## The "Aha! Loop" Flow

1. **Child marks task complete:**
   ```
   POST /api/claims
   ```

2. **Parent receives notification:**
   ```
   GET /api/notifications
   ```

3. **Parent verifies claim:**
   ```
   PUT /api/claims/:id/verify
   ```

4. **Points automatically awarded** (handled by backend)

5. **Both parent and child receive notifications** (handled by backend)

6. **Child sees updated point balance:**
   ```
   GET /api/points/child/:childProfileId/balance
   ```

---

## Critical Metrics

### NER (Notification Engagement Rate)
**Target:** Parent ≥65%, Child ≥70%

```
GET /api/notifications/metrics/ner
```

### RDT (Reward Delivery Time)
**Target:** ≤7 days

```
GET /api/rewards/metrics/rdt
```

### SSR (Streak Survival Rate)
**Target:** ≥40%

Calculated via StreakService (not exposed as endpoint yet)

### FAR (Family Active Rate)
**Target:** ≥60% at 21 days, ≥40% at 60 days

Calculated via analytics (not implemented yet)

---

## Development Notes

### Running the Server
```bash
cd backend
npm run dev
```

### Seeding the Library
```bash
curl -X POST http://localhost:3001/api/library/seed \
  -H "Authorization: Bearer <token>"
```

### Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@test.com",
    "password": "password123",
    "role": "admin_parent",
    "name": "Test Parent"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@test.com",
    "password": "password123"
  }'
```

**Health Check:**
```bash
curl http://localhost:3001/health
```
