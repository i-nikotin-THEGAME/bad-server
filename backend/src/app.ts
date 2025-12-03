import { errors } from 'celebrate'
import { nestCsrf } from 'ncsrf'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000, ORIGIN_ALLOW } = process.env
const app = express()

const createLimiter = (windowMs: number, limit: number) => 
    rateLimit({
        windowMs,
        max: limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 429,
            message: 'Слишком много запросов. Пожалуйста, попробуйте позже.'
        }
    })

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
app.use(createLimiter(15 * 60 * 1000, 100))

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
