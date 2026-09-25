import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  if (roles.length === 0) return next();
  const user = (req as any).user;
  if (!user) return res.status(401).json({ code: ERROR_CODES.AUTH_REQUIRED, message: ERROR_MESSAGES.AUTH_REQUIRED });
  if (!roles.includes(user.role)) return res.status(403).json({ code: ERROR_CODES.RBAC_DENIED, message: ERROR_MESSAGES.RBAC_DENIED });
  return next();
};
