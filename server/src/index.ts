import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const server = Fastify({ logger: true })

server.register(cors, {
  origin: true,
  credentials: true
})

server.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

server.post('/api/auth/register', async (request, reply) => {
  const { email, password } = request.body as any

  const user = await prisma.user.create({
    data: { email, password }
  })

  return { message: 'Usuario criado!', userId: user.id }
})

server.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as any

  const user = await prisma.user.findFirst({
    where: { email, password }
  })

  if (!user) {
    return reply.status(401).send({ message: 'Credenciais invalidas' })
  }

  return {
    token: 'jwt-token-simples',
    userId: user.id,
    message: 'Login realizado!'
  }
})

server.get('/api/players', async () => {
  const players = await prisma.player.findMany()
  return { players }
})

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Servidor rodando em http://localhost:3001')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()