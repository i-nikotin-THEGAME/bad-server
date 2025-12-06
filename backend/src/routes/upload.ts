import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware, { validateMinFileSize } from '../middlewares/file'

const uploadRouter = Router()
uploadRouter.post('/', fileMiddleware.single('file'), validateMinFileSize(2 * 1024), uploadFile)

export default uploadRouter
