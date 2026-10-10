import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface JwtPayload {
  userId: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({
      message: "Authentication required.",
    });
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Invalid authorization format.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      message: "Authentication token is missing.",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({
      message: "JWT_SECRET is not defined.",
    });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      message: "Invalid or expired token.",
    });
    return;
  }

  try {
    const user = await User.findById(decoded.userId).select("role isActive");
    if (!user) {
      res.status(401).json({ message: "The account for this session no longer exists." });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ message: "This account has been deactivated." });
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };
    next();
  } catch (error) {
    console.error("Load authenticated user error:", error);
    res.status(500).json({ message: "Unable to verify the current account role." });
  }
};