import type { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'

import { auth, type User } from '../lib/auth.ts'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })

  if (!session) {
    res.status(401).json({ message: 'Пользователь не авторизован!' })
    return
  }

  req.user = session.user

  next()
}
