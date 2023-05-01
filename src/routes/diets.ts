/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify/types/instance'
import { knex } from '../database'
import { z as zod } from 'zod'
import { randomUUID } from 'crypto'

export async function DietsRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const dietBody = zod.object({
      name: zod.string(),
      description: zod.string(),
      dateTime: zod.string().datetime(),
      isOnDiet: zod.boolean(),
    })

    const { name, dateTime, description, isOnDiet } = dietBody.parse(
      request.body,
    )

    await knex('diets').insert({
      id: randomUUID(),
      name,
      description,
      date_time: dateTime,
      is_on_diet: isOnDiet,
      user_id: request.user.sub,
    })

    return reply.status(201).send()
  })

  app.get('/', { onRequest: [app.authenticate] }, async (request) => {
    const { sub: user_id } = request.user

    const diets = await knex('diets')
      .where({ user_id })
      .orderBy('date_time', 'desc')

    return { diets }
  })
}
