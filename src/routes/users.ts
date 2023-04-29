import { FastifyInstance } from 'fastify/types/instance'
import bcrypt from 'bcrypt'
import { z as zod } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export function UsersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userBody = zod.object({
      name: zod.string().min(5),
      email: zod.string().email(),
      password: zod.string().min(5),
    })

    const { name, email, password } = userBody.parse(request.body)

    const passwordHash = await bcrypt.hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      email,
      name,
      password: passwordHash,
    })

    return reply.status(201).send()
  })
}
