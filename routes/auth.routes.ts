import { Router } from 'express'
import { signin, signinSuccess } from '../controllers/auth.controllers.ts'

const router = Router()

router.get('/signin', signin)
router.get('/success', signinSuccess)

export default router
