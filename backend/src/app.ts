import { errors } from 'celebrate'
import { nestCsrf } from 'ncsrf'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import { apiLimiter } from './middlewares/rateLimit'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000, ORIGIN_ALLOW } = process.env
const app = express()

// Создаем каталоги если их нет
const createUploadDirectories = () => {
    const srcPublicDir = path.join(process.cwd(), 'src', 'public')
    const tempDir = path.join(srcPublicDir, process.env.UPLOAD_PATH_TEMP || 'temp')
    const imagesDir = path.join(srcPublicDir, process.env.UPLOAD_PATH || 'images')
    const directories: string[] = [srcPublicDir, tempDir, imagesDir]
    directories.forEach((dir: string) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    })
    return tempDir
}
createUploadDirectories()

// 1. Безопасность и CORS
app.use(cookieParser())
app.use(nestCsrf())
// app.use(cors())
app.use(cors({ 
    origin: ORIGIN_ALLOW || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Length', 'Content-Type']
}));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}))

// 2. Статические файлы
app.use(serveStatic(path.join(__dirname, 'public')))

// 3. Парсинг тела запроса
app.use(urlencoded({ extended: true }))
app.use(json())

// 4. Rate limiter
app.use('/auth', apiLimiter)
app.use('/products', apiLimiter)
app.use('/orders', apiLimiter)
app.use('/customers', apiLimiter)

// 5. CORS для preflight запросов
app.options('*', cors())

// 6. Основные роуты
app.use(routes)

// 7. Обработка ошибок
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
