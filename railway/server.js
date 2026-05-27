const jsonServer = require('json-server')
const cors       = require('cors')

const server      = jsonServer.create()
const router      = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
server.options('*', cors())   // ← OPTIONS preflight 처리
server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`✅ JSON Server running on port ${PORT}`))