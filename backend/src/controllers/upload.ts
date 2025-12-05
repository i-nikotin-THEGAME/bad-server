import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { fileTypeFromBuffer } from 'file-type'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        const uint8Array = new Uint8Array(req.file.buffer)

        const fileType = await fileTypeFromBuffer(uint8Array)
        
        if (!fileType) {
            return next(new BadRequestError('Не удалось определить тип файла'))
        }
        
        // Проверяем, что файл действительно изображение
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml']
        
        if (!allowedTypes.includes(fileType.mime)) {
            return next(new BadRequestError('Файл не является изображением'))
        }
        
        // Проверяем соответствие заявленного mimetype и реального
        if (fileType.mime !== req.file.mimetype) {
            return next(new BadRequestError('Несоответствие типа файла'))
        }
        
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
