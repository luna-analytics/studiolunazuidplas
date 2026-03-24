import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JWTPayload = {
  userId: string;
  isAdmin: boolean;
};

export const JWT_SECRET = process.env.JWT_SECRET ?? "studio-luna-secret-change-in-prod";

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Niet ingelogd" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Sessie verlopen, log opnieuw in" });
    return;
  }
  (req as any).user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!(req as any).user?.isAdmin) {
      res.status(403).json({ error: "Geen toegang" });
      return;
    }
    next();
  });
}
