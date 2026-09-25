import type { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (handler: (req: Request, res: Response) => unknown | Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
