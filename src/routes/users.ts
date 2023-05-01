import { FastifyInstance } from 'fastify/types/instance'
import bcrypt from 'bcrypt'
import { z as zod } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function UsersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userBody = zod.object({
      name: zod.string().min(5),
      email: zod.string().email(),
      password: zod.string().min(8),
    })

    const { name, email, password } = userBody.parse(request.body)

    const isEmailAlreadyExists = await knex('users').where({ email }).first()

    if (isEmailAlreadyExists) {
      return reply.send({ error: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      email,
      name,
      password: passwordHash,
    })

    return reply.status(201).send()
  })

  app.post('/authenticate', async (request, reply) => {
    const authorizationBody = zod.object({
      email: zod.string().email(),
      password: zod.string().min(8),
    })

    const { email, password } = authorizationBody.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.send({ error: 'Email or password are incorrect' })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return reply.send({ error: 'Email or password are incorrect' })
    }

    const token = app.jwt.sign(
      {},
      {
        sub: user.id,
        expiresIn: 1000 * 60 * 60 * 3, // 3 Horas
      },
    )

    return { token }
  })
}
