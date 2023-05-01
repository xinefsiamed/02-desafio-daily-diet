import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { UsersRoutes } from './routes/users'
import { env } from './env'
import { FastifyRequest } from 'fastify/types/request'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.decorate(
  'authenticate',
  async (request: FastifyRequest) => await request.jwtVerify(),
)

app.register(UsersRoutes, {
  prefix: 'users',
})
