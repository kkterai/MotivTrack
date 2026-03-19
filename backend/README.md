# MotivTrack Backend

Backend API for MotivTrack - An ADHD-focused task and reward system for families.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth + JWT
- **Real-time**: Supabase Realtime

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string from Supabase
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations)
- `JWT_SECRET`: Secret key for JWT signing (generate a strong random string)

### 3. Database Setup

Generate Prisma Client:
```bash
npm run prisma:generate
```

Run migrations:
```bash
npm run prisma:migrate
```

Open Prisma Studio (optional - database GUI):
```bash
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   └── middlewares/     # Auth, validation, etc.
│   ├── services/            # Business logic
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript type definitions
│   └── app.ts               # Express app setup
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
└── package.json
```

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List tasks for a child
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Archive task

### Task Claims
- `POST /api/claims` - Child claims task completion
- `PUT /api/claims/:id/verify` - Parent verifies claim
- `GET /api/claims/pending` - Get pending claims

### Points
- `GET /api/points/:childId` - Get point balance
- `GET /api/points/:childId/history` - Get point transaction history

### Rewards
- `GET /api/rewards/:childId` - List rewards
- `POST /api/rewards` - Create reward
- `POST /api/rewards/:id/redeem` - Redeem reward
- `PUT /api/rewards/:id/deliver` - Mark reward as delivered

### Library
- `GET /api/library/tasks` - Browse curated task library
- `GET /api/library/tasks/:id` - Get library task details

### Teachers (Phase 2)
- `POST /api/teachers/invite` - Invite teacher
- `POST /api/behavior/ratings` - Submit behavior rating
- `GET /api/behavior/ratings/:childId` - Get ratings for child

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/open` - Mark notification as opened

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

## Database Schema

See `prisma/schema.prisma` for the complete data model. Key entities:

- **User**: Admin Parent, Delivery Parent, Child, Teacher roles
- **ChildProfile**: Child information and settings
- **Task**: Assigned tasks (from library or custom)
- **TaskClaim**: Child's completion claims
- **PointTransaction**: Immutable point history
- **Reward**: Available rewards
- **StreakRecord**: Daily/weekly streak tracking
- **NotificationLog**: Notification engagement tracking

## Key Features

### Immutability
`PointTransaction` and `BehaviorRating` records are immutable and enforced via Supabase Row-Level Security (RLS).

### Streak Calculation
Streaks are calculated server-side using SQL queries to ensure accuracy.

### Notification Tracking
All notifications are logged with `sentAt` and `openedAt` timestamps for engagement metrics (NER - Notification Engagement Rate).

## Legal Compliance

This application handles data for children under 13 and must comply with:
- COPPA (Children's Online Privacy Protection Act)
- CCPA/CPRA (California Consumer Privacy Act)

See the main PRD for full compliance requirements.

## License

Proprietary - All rights reserved
