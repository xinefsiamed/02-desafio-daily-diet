// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
    }
    diets: {
      id: string
      name: string
      description: string
      date_time: string
      is_on_diet: boolean
      user_id: string
    }
  }
}
