// Import required libraries
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;


if (!PINECONE_API_KEY) {
  throw new Error("Missing API keys. Please set PINECONE_API_KEY and OPENAI_API_KEY in your .env file.");
}

// Initialize Pinecone client
export const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

// Function to create a Pinecone index
export async function createIndex(indexName: string) {
  try {
    console.log(`Creating index: ${indexName}`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI's embedding size
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1"
        }
      }
    });
    console.log("Index created successfully.");
  } catch (error: any) {
    console.error("Error creating index:", error.message);
  }
}

// Function to upsert embeddings into Pinecone
export async function upsertRecords(indexName: string, records: any) {
  try {
    const index = pinecone.index(indexName);
    await index.namespace("products").upsert(records);
    console.log("✅ Successfully upserted product vectors!");

    const stats = await index.describeIndexStats();
    console.log("📊 Index Stats:", stats);
  } catch (error: any) {
    console.error("🚨 Error upserting records:", error.message);
  }
}

interface userPreferences {
  color: string
  category: string
  min_price: number
  max_price: number
  size: string
  preferred_brands: string[]
}

// Function to query similar vectors from Pinecone
export async function queryVector(indexName: string, queryEmbedding: number[], topK = 5) {
  const index = pinecone.index(indexName);
  const response = await index.namespace("products").query({
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true, // Get metadata (e.g., product details)
  });
  return response;
}

// // Function to query Pinecone and personalize recommendations
// export async function getPersonalizedRecommendations(userPreferences: userPreferences, topK = 5, indexName = "product-recommendations") {

//   try {
//     console.log(`Generating embedding for user preferences...`);

//     // Step 1: Convert user preferences into a searchable text string
//     const userQuery = `
//       Eu gosto de roupas na cor ${userPreferences.color} e prefiro a categoria ${userPreferences.category}. 
//       Meu orçamento é entre R$${userPreferences.min_price} e R$${userPreferences.max_price}. 
//       Meu tamanho é ${userPreferences.size}. Prefiro produtos das marcas ${userPreferences.preferred_brands.join(", ")}.
//     `;

//     const queryEmbedding = await generateTextEmbedding(userQuery);
//     console.log("Embedding generated. Querying Pinecone...");

//     // Step 2: Query Pinecone for similar vectors
//     const index = pinecone.index(indexName);
//     const response = await index.namespace("products").query({
//       vector: queryEmbedding,
//       topK: topK,
//       includeMetadata: true, // Get metadata (e.g., product details)
//     });

//     console.log("Pinecone query response:", JSON.stringify(response, null, 2));

//     // Step 3: Filter results based on user preferences (price, color, size, etc.)
//     const recommendations = response.matches
//     .map(match => ({
//       id: match.id,
//       title: match?.metadata?.title,
//       category: match?.metadata?.category,
//       color: match?.metadata?.color || "", // Ensure it's always a string
//       price: match?.metadata?.price || 0, // Default to 0 if missing
//       sizes: match?.metadata?.sizes || [], // Default to empty array
//       brand: match?.metadata?.brand || "Unknown", // Default brand if missing
//       image_urls: match?.metadata?.image_urls || [], // Ensure it's an array
//       score: match?.score, // Similarity score
//     }))
//     .filter(item =>
//       Number(item.price) >= userPreferences.min_price &&
//       Number(item.price) <= userPreferences.max_price &&
//       typeof item.color === "string" && // ✅ Ensure color is a string
//       item.color.toLowerCase().includes(userPreferences.color.toLowerCase()) && // ✅ Allow partial matching for colors
//       (Array.isArray(item.sizes) ? item.sizes.includes(userPreferences.size) : true) && // ✅ Skip filtering if sizes are missing
//       (userPreferences.preferred_brands.length === 0 || userPreferences.preferred_brands.includes(item.brand)) // ✅ Allow results if brand is missing
//     );


//     console.log("🎯 Personalized Recommendations:", recommendations);
//     return recommendations;
//   } catch (error: any) {
//     console.error("Error retrieving personalized recommendations:", error.message);
//     return [];
//   }
// }
