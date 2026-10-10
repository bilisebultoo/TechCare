import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const roleMiddleware = (
  requiredRole: string
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        message: `This action requires an ${requiredRole.toLowerCase()} account. The current account role is ${req.user.role.toLowerCase()}.`,
      });
      return;
    }

    next();
  };
};