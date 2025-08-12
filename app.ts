import express, { type Request, type Response } from 'express'
import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import 'dotenv/config'

import { auth } from './lib/auth.ts'
import apiRoutes from './routes/api/index.ts'
import authRoutes from './routes/auth.routes.ts'

const PORT = process.env.PORT || 3000
//Create app
const app = express()

app.set('view engine', 'pug')
app.use(express.static('public'))

/**
 * Don’t use express.json() before the Better Auth handler.
 * Use it only for other routes, or the client API will get stuck on "pending".
 */
app.all('/api/auth/*splat', toNodeHandler(auth))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: '*' }))

// Routing
app.use('/api', apiRoutes)
app.use('/auth', authRoutes)

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: '404 | Not found.' })
})

// Start our app
app.listen(PORT, () => console.log(`Server running → PORT: ${PORT}`))
