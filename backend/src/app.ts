import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './api/routes/auth.routes.js';
import taskRoutes from './api/routes/task.routes.js';
import taskAssignmentRoutes from './api/routes/taskAssignment.routes.js';
import claimRoutes from './api/routes/claim.routes.js';
import pointRoutes from './api/routes/point.routes.js';
import rewardRoutes from './api/routes/reward.routes.js';
import libraryRoutes from './api/routes/library.routes.js';
import notificationRoutes from './api/routes/notification.routes.js';
import seedRoutes from './api/routes/seed.routes.js';
import invitationRoutes from './api/routes/invitation.routes.js';
import childProfileRoutes from './api/routes/childProfile.routes.js';
import childOnboardingRoutes from './api/routes/childOnboarding.routes.js';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', taskAssignmentRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/child-profiles', childProfileRoutes);
app.use('/api/child-onboarding', childOnboardingRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 MotivTrack Backend running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
