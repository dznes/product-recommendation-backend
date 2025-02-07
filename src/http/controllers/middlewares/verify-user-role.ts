import { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUserRole(roleToVerify: 'admin' | 'customer') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user

    if (user?.role !== roleToVerify) {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }
  }
}
