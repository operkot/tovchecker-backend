import { Router } from 'express'

import * as layersControllers from '../../controllers/layers.controllers.ts'

const router = Router()

router.post('/check', layersControllers.check)

export default router
