// Re-export shared types
export * from '../../../shared/types';

// Additional backend-specific types
import mongoose from 'mongoose';
import { Request } from 'express';

export interface DatabaseConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
