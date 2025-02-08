import { FastifyInstance } from 'fastify'
import { createEmbedding } from './create-embedding'

export async function EmbeddingRoutes(app: FastifyInstance) {
  app.get('/embeddings', createEmbedding)
}
