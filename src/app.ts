import fastify from 'fastify'
import { UsersRoutes } from './routes/users'

export const app = fastify()

app.register(UsersRoutes, {
  prefix: 'users',
})
