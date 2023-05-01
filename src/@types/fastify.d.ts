// eslint-disable-next-line
import fastify from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: () => void
  }
}
