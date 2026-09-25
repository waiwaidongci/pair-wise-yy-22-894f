import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createHttpError } from "../utils/httpError";

export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, _res, next) => {
  const role = (req as unknown as { user?: { role?: string } }).user?.role ?? "admin";
  if (role === "admin" || roles.length === 0 || roles.includes(role)) return next();
  return next(createHttpError(403, ERROR_CODES.RBAC_DENIED, ERROR_MESSAGES.RBAC_DENIED));
};
