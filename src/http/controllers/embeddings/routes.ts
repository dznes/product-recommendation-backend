import { FastifyInstance } from 'fastify'
import { upsertProductsEmbedding } from './upsert-products-embedding'
import { productRecommendation } from './product-recommendation'

export async function EmbeddingRoutes(app: FastifyInstance) {
  app.post('/embeddings', upsertProductsEmbedding)
  app.post('/embeddings/product-recommendation', productRecommendation)
}
