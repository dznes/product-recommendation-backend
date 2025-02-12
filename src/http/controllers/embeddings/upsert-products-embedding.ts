import { getProducts } from "@/lib/database";
import { generateProductEmbeddings } from "@/lib/openai";
import { createIndex, upsertRecords } from "@/lib/pinecone";
import { FastifyReply, FastifyRequest } from "fastify";
// import * as z from "zod";

export async function upsertProductsEmbedding(request: FastifyRequest, reply: FastifyReply) {
  // const productSchema = z.object({
  //   id: z.string(),
  //   title: z.string(),
  //   category: z.string(),
  //   subcategory: z.string(),
  //   description: z.string(),
  //   tags: z.array(z.string()),
  //   color: z.string(),
  //   material: z.string(),
  //   sizes: z.array(z.string()),
  //   image_urls: z.array(z.string().url()),
  //   season: z.string(),
  //   brand: z.string(),
  //   price: z.number().positive(),
  //   cost: z.number().positive(),
  //   discount: z.number().min(0).max(1), // Discount as a fraction (0.10 = 10%)
  //   stock_quantity: z.number().int().nonnegative(),
  //   integration_code: z.string(),
  // });

  // const requestSchema = z.object({
  //   products: z.array(productSchema),
  // });

  // // Validate request body
  // const { products } = requestSchema.parse(request.body);

  const products = await getProducts()

  try {
    const indexName = "products"
    await createIndex(indexName)
    const records = await generateProductEmbeddings(products)
    // Step 3: Upsert records to Pinecone
    console.log(records)
    await upsertRecords(indexName, records);
    return reply.status(201).send("Setup complete!")

  } catch (err) {
    // return reply.status(500).send() // FIX ME
    throw err
  }
}