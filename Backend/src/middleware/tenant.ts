import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get schoolId from authenticated user
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(400).json({
      success: false,
      message: 'School context not found',
    });
  }

  // Attach schoolId to request for use in controllers
  req.schoolId = schoolId;
  next();
};

declare global {
  namespace Express {
    interface Request {
      schoolId?: string;
    }
  }
}