import { generateProductEmbeddings } from "@/lib/openai";
import { createIndex, upsertRecords } from "@/lib/pinecone";
import { FastifyReply, FastifyRequest } from "fastify";
import * as z from "zod";

export async function createEmbedding(request: FastifyRequest, reply: FastifyReply) {
  const productSchema = z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    subcategory: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    color: z.string(),
    material: z.string(),
    sizes: z.array(z.string()),
    image_urls: z.array(z.string().url()),
    season: z.string(),
    brand: z.string(),
    price: z.number().positive(),
    cost: z.number().positive(),
    discount: z.number().min(0).max(1), // Assuming discount is a fraction (e.g., 0.10 for 10%)
    stock_quantity: z.number().int().nonnegative(),
    integration_code: z.string(),
  });

  const {
    id,
    title,
    category,
    subcategory,
    description,
    tags,
    color,
    material,
    sizes,
    image_urls,
    season,
    brand,
    price,
    cost,
    discount,
    stock_quantity,
    integration_code,
  } = productSchema.parse(request.body)

  try {
    const indexName = "products"
    await createIndex(indexName)
    const records = generateProductEmbeddings({
      id,
      title,
      category,
      subcategory,
      description,
      tags,
      color,
      material,
      sizes,
      image_urls,
      season,
      brand,
      price,
      cost,
      discount,
      stock_quantity,
      integration_code,
    })
    // Step 3: Upsert records to Pinecone
    await upsertRecords(indexName, records);
    return reply.status(201).send("Setup complete!")

  } catch (err) {
    // return reply.status(500).send() // FIX ME
    throw err
  }
}