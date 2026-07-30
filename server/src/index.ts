import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const server = Fastify({ logger: true })

const JWT_SECRET = process.env.JWT_SECRET || 'mu-idle-dev-secret-key-change-in-production'
const SALT_ROUNDS = 10

server.register(cors, {
  origin: true,
  credentials: true
})

interface RegisterBody {
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password: string): boolean {
  return password.length >= 6
}

async function authenticate(request: Fastify.FastifyRequest, reply: Fastify.FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ message: 'Token nao fornecido' })
  }
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    ;(request as any).userId = decoded.userId
  } catch {
    return reply.status(401).send({ message: 'Token invalido' })
  }
}

server.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

server.post<{ Body: RegisterBody }>('/api/auth/register', async (request, reply) => {
  try {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ message: 'Email e senha sao obrigatorios' })
    }
    if (!isValidEmail(email)) {
      return reply.status(400).send({ message: 'Email invalido' })
    }
    if (!isValidPassword(password)) {
      return reply.status(400).send({ message: 'Senha deve ter no minimo 6 caracteres' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.status(409).send({ message: 'Email ja cadastrado' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: { email, password: passwordHash }
    })

    return { message: 'Usuario criado!', userId: user.id }
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
})

server.post<{ Body: LoginBody }>('/api/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ message: 'Email e senha sao obrigatorios' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.status(401).send({ message: 'Credenciais invalidas' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return reply.status(401).send({ message: 'Credenciais invalidas' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })

    return {
      token,
      userId: user.id,
      message: 'Login realizado!'
    }
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
})

server.post('/api/auth/logout', async (request, reply) => {
  return { message: 'Logout realizado' }
})

server.get('/api/players', { preHandler: [authenticate] }, async (request) => {
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
