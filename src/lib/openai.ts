import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing API keys. Please set PINECONE_API_KEY and OPENAI_API_KEY in your .env file.");
}


// Initialize OpenAI client
export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Function to generate an embedding for a given text (e.g., product title + description)
export async function generateTextEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

// Function to generate embeddings using OpenAI
export async function generateProductEmbeddings(data: any) {
  const texts = data.map(d => `${d.title}. ${d.description}. Tags: ${d.tags.join(', ')}`);

  console.log("Generating embeddings for:", texts);

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002", // OpenAI's best embedding model
    input: texts,
  });

  return response.data.map((res, i) => ({
    id: String(data[i].id), // Convert ID to string before storing in Pinecone
    values: res.embedding,
    metadata: {
      title: data[i].title,
      slug: data[i].slug,
      category: data[i].category,
      subcategory: data[i].subcategory,
      description: data[i].description,
      tags: data[i].tags,
      color: data[i].color,
      material: data[i].material,
      sizes: data[i].sizes,
      season: data[i].season,
      brand: data[i].brand,
      price: data[i].price,
      cost: data[i].cost,
      discount: data[i].discount,
      stock_quantity: data[i].stock_quantity,
      integration_code: data[i].integration_code
    }
  }));
}