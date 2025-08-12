import { Router } from 'express'

import documentsRoutes from './documents.routes.ts'
import layersRoutes from './layers.routes.ts'

const router = Router()

router.use('/documents', documentsRoutes)
router.use('/layers', layersRoutes)

export default router
