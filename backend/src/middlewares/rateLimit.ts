import rateLimit from 'express-rate-limit'

export const createLimiter = (windowMs: number, limit: number) => 
    rateLimit({
        windowMs,
        max: limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 429,
            message: 'Слишком много запросов. Пожалуйста, попробуйте позже.'
        },
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    })

    export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Слишком много запросов. Пожалуйста, попробуйте позже.'
    },
    keyGenerator: (req) => {
        // Используем IP + токен для уникальности
        const token = req.headers.authorization || 'no-token'
        return req.ip + token
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
})