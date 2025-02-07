import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export async function AppRoutes(app: FastifyInstance) {
  app.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      return { hello: 'world' }
    }
  )
}
