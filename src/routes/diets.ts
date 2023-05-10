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

  app.get('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const routeParam = zod.object({
      id: zod.string().uuid().nonempty({ message: 'id cannot be empty.' }),
    })

    const { id } = routeParam.parse(request.params)

    const diet = await knex('diets').where({ id }).first()

    if (!diet) {
      reply.status(404).send({ message: 'diet cannot be found' })
      return
    }

    if (diet.user_id !== request.user.sub) {
      reply.status(401)
      return
    }

    return {
      diet,
    }
  })

  app.patch(
    '/:id',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const dietBody = zod.object({
        name: zod.string(),
        description: zod.string(),
        dateTime: zod.string().datetime(),
        isOnDiet: zod.boolean(),
      })

      const routeParam = zod.object({
        id: zod.string().uuid().nonempty({ message: 'id cannot be empty.' }),
      })

      const { name, description, dateTime, isOnDiet } = dietBody.parse(
        request.body,
      )

      const { id } = routeParam.parse(request.params)

      const diet = await knex('diets').where({ id }).first()

      if (!diet) {
        reply.status(404).send({ message: 'Diet not found!' })
        return
      }

      if (diet.user_id !== request.user.sub) {
        reply.status(401)
        return
      }

      await knex('diets').where({ id }).update({
        name,
        date_time: dateTime,
        description,
        is_on_diet: isOnDiet,
      })

      reply.status(201)
    },
  )

  app.delete(
    '/:id',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const routeParam = zod.object({
        id: zod.string().uuid().nonempty({ message: 'id cannot be empty.' }),
      })

      const { id } = routeParam.parse(request.params)

      const diet = await knex('diets').where({ id }).first()

      if (!diet) {
        reply.status(404).send({ message: 'Diet not found.' })
        return
      }

      if (diet.user_id !== request.user.sub) {
        reply.status(401)
        return
      }

      await knex('diets').where({ id }).delete()

      reply.status(200)
    },
  )
}
