import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { BaseErrorResponse } from 'src/shared/types/base.error.response';
import { SecurityContext } from '../context/security.context';
import { JwtLoginService } from '../jwt/jwt.login.service';

// Routes bypassed from JWT verification.
// Supports exact paths ('/users/register') and wildcards ('/users/*').
const PUBLIC_ROUTES: string[] = ['/users/register', '/users/login'];

function isPublicRoute(originalUrl: string): boolean {
  const path = originalUrl.split('?')[0];
  console.log(path);

  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith('/*')) {
      const prefix = route.slice(0, -2);
      return path === prefix || path.startsWith(prefix + '/');
    }
    return path === route;
  });
}

@Injectable()
export class JwtVerificationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtLoginService: JwtLoginService,
    private readonly securityContext: SecurityContext,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (isPublicRoute(req.originalUrl)) return next();

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          new BaseErrorResponse(
            'Missing or malformed authorization header',
            HttpStatus.UNAUTHORIZED,
          ),
        );
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtLoginService.verifyAccessToken(token);
      this.securityContext.userId = payload.userId;
      this.securityContext.role = payload.role;
      next();
    } catch {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          new BaseErrorResponse(
            'Invalid or expired token',
            HttpStatus.UNAUTHORIZED,
          ),
        );
    }
  }
}
