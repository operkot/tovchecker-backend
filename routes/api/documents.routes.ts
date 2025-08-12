import { Router } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.ts'
import { upload } from '../../middlewares/upload.middleware.ts'
import * as documentsControllers from '../../controllers/documents.controllers.ts'

const router = Router()

router.get('/', authMiddleware, documentsControllers.findAll)
router.get('/:id', authMiddleware, documentsControllers.findOne)
router.post(
  '/recognize',
  authMiddleware,
  upload.single('file'),
  documentsControllers.recognize
)
router.post('/', authMiddleware, documentsControllers.createOne)
router.put('/:id', authMiddleware, documentsControllers.updateOne)
router.delete('/:id', authMiddleware, documentsControllers.deleteOne)

export default router
