import type { Request, Response } from 'express'

export const signin = (req: Request, res: Response) => {
  res.render('signin')
}

export const signinSuccess = (req: Request, res: Response) => {
  res.render('signin-success')
}
