import { generateTextEmbedding } from "@/lib/openai";
import { queryVector } from "@/lib/pinecone";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

export async function productRecommendation(request: FastifyRequest, reply: FastifyReply) {
  const requestSchema = z.object({
    color: z.string(),
    category: z.string(),
    min_price: z.number(),
    max_price: z.number(),
    size: z.string(),
  });

  // Validate request body
  const userPreferences = requestSchema.parse(request.body);

  try {
      // Step 1: Convert user preferences into a searchable text string
      const userQuery = `
      Eu gosto de roupas na cor ${userPreferences.color} e prefiro a categoria ${userPreferences.category}. 
      Meu orçamento é entre R$${userPreferences.min_price} e R$${userPreferences.max_price}. 
      Meu tamanho é ${userPreferences.size}.
      `;

      const queryEmbedding = await generateTextEmbedding(userQuery);
      console.log("Embedding generated. Querying Pinecone...");

      const vectors = await queryVector("products", queryEmbedding, 5);

      console.log("Pinecone query response:", JSON.stringify(vectors, null, 2));

      // Step 3: Filter results based on user preferences (price, color, size, etc.)
      const recommendations = vectors.matches
      .map(match => ({
        id: match.id,
        title: match?.metadata?.title,
        category: match?.metadata?.category,
        colors: match?.metadata?.colors || "", // Ensure it's always a string
        price_wholesale: match?.metadata?.price_wholesale || 0, // Default to 0 if missing
        sizes: match?.metadata?.sizes || [], // Default to empty array
        score: match?.score, // Similarity score
      }))
      .filter(item =>
        Number(item.price_wholesale) >= userPreferences.min_price &&
        Number(item.price_wholesale) <= userPreferences.max_price 
        &&
        typeof item.colors === "string" && // ✅ Ensure color is a string
        item.colors.toLowerCase().includes(userPreferences.color.toLowerCase()) // ✅ Allow partial matching for colors
        // (userPreferences.preferred_brands.length === 0 || userPreferences.preferred_brands.includes(item.brand)) // ✅ Allow results if brand is missing
      );

      console.log("\n🔥 Top 5 Personalized Products:");
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.title} (${rec.colors}) - R$${rec.price_wholesale} [Score: ${rec.score?.toFixed(4)}]`);
      });

    return reply.status(201).send(recommendations)

  } catch (err) {
    // return reply.status(500).send() // FIX ME
    throw err
  }
}