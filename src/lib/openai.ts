import dotenv from "dotenv";
import OpenAI from "openai";

import { Assistant } from "openai/resources/beta/assistants";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";
import { tools } from './tools';


import { prompt } from "./tools/prompt";

import { Product } from "@/@types/database/product";

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

export interface Product2 {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  color: string;
  material: string;
  sizes: string[];
  image_urls: string[];
  season: string;
  brand: string;
  price: number;
  cost: number;
  discount: number; // Expected to be between 0 and 1 (e.g., 0.10 for 10%)
  stock_quantity: number;
  integration_code: string;
}

// Function to normalize embeddings
const normalizeEmbedding = (embedding: number[]) => {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / magnitude);
};

// Function to batch OpenAI embedding requests (reduces API calls)
async function batchGenerateEmbeddings(inputs: string[], model = "text-embedding-3-small") {
  try {
    const response = await openai.embeddings.create({ model, input: inputs });
    return response.data.map((d) => d.embedding);
  } catch (error: any) {
    console.error("Error generating embeddings:", error.message);
    return inputs.map(() => new Array(1536).fill(0)); // Fallback to zero vector
  }
}

// // Function to generate product embeddings
// export async function generateProductEmbeddings(products: Product2[]) {
//   const records = [];

//   for (let product of products) {
//     try {
//       // Step 1: Generate multiple text embeddings (title, description, tags)
//       const textInputs = [
//         product.title,
//         product.description,
//         `Tags: ${product.tags.join(", ")}`,
//       ].filter(Boolean); // Remove empty values

//       const textEmbeddings = await batchGenerateEmbeddings(textInputs);
//       const averagedTextEmbedding = textEmbeddings[0].map((_, index) =>
//         textEmbeddings.reduce((sum, embed) => sum + embed[index], 0) / textEmbeddings.length
//       );

//       // Step 2: Generate image embeddings (if available)
//       let imageEmbeddings = [];
//       for (const url of Object.values(product.image_urls)) {
//         const imageEmbedding = await batchGenerateEmbeddings([url]);
//         imageEmbeddings.push(imageEmbedding[0]);
//       }

//       // Average all image embeddings
//       const averagedImageEmbedding = imageEmbeddings.length
//         ? imageEmbeddings[0].map((_, index) =>
//             imageEmbeddings.reduce((sum, embed) => sum + embed[index], 0) / imageEmbeddings.length
//           )
//         : new Array(1536).fill(0); // Fallback if no images

//       // Step 3: Weighted combination of text and image embeddings
//       const imageWeight = product.category.match(/fashion|home decor|art/i) ? 0.6 : 0.3; // Higher weight for visual products
//       const textWeight = 1 - imageWeight;

//       const combinedEmbedding = averagedTextEmbedding.map((val, index) =>
//         textWeight * val + imageWeight * averagedImageEmbedding[index]
//       );

//       // Step 4: Normalize embedding for consistency
//       const normalizedEmbedding = normalizeEmbedding(combinedEmbedding);

//       // Step 5: Prepare metadata and vector for Pinecone
//       records.push({
//         id: String(product.id),
//         values: normalizedEmbedding,
//         metadata: {
//           title: product.title,
//           category: product.category,
//           description: product.description,
//           tags: product.tags,
//           color: product.color,
//           sizes: product.sizes,
//           material: product.material,
//           brand: product.brand,
//           price: product.price,
//           image_urls: product.image_urls,
//         },
//       });
//     } catch (error: any) {
//       console.error(`Error generating embeddings for product ${product.id}:`, error.message);
//     }
//   }

//   return records;
// }

// Function to generate product embeddings (image-based only)
export async function generateProductEmbeddings(products: Product[]) {
  const records = [];

  for (let product of products) {
    try {
      // Collect unique image file keys from all SKUs
      const productImages = Array.from(
        new Set(product.skus.flatMap(sku => sku.product_images?.map(img => img.file_key) || []))
      );

      if (productImages.length === 0) {
        console.warn(`Skipping product ${product.id} - No images found`);
        continue; // Skip products without images
      }

      // Generate image embeddings
      let imageEmbeddings = [];
      for (const url of productImages) {
        const imageEmbedding = await batchGenerateEmbeddings([url]);
        imageEmbeddings.push(imageEmbedding[0]);
      }

      // Average all image embeddings
      const averagedImageEmbedding = imageEmbeddings.length
        ? imageEmbeddings[0].map((_, index) =>
            imageEmbeddings.reduce((sum, embed) => sum + embed[index], 0) / imageEmbeddings.length
          )
        : new Array(1536).fill(0); // Fallback if no images

      // Normalize embedding for consistency
      const normalizedEmbedding = normalizeEmbedding(averagedImageEmbedding);

      // Prepare metadata for Pinecone
      records.push({
        id: String(product.id),
        values: normalizedEmbedding,
        metadata: {
          title: product.title,
          slug: product.slug,
          category: product.categories?.map(c => c.title).join(", ") || "Uncategorized",
          colors: product.colors?.map(c => c.title).join(", ") || "Multiple",
          sizes: product.sizes?.map(s => s.title).join(", ") || "Various",
          reference_name: product.reference_name ?? "",
          price_wholesale: product.price_wholesale ?? '',
          price_retail: product.price_retail ?? '',
          cost: product.cost ?? '',
        },
      });
    } catch (error: any) {
      console.error(`Error generating embeddings for product ${product.id}:`, error.message);
    }
  }

  return records;
}

// Create OpenAI assistant
export async function createAssistant(): Promise<Assistant> {
  return await openai.beta.assistants.create({
      model: "gpt-4o-mini",
      name: "Alt",
      instructions: prompt,
      tools: Object.values(tools).map(tool => tool.definition)
  });
}


// FUNCTIONS FOR OPENAI AGENTS

// Create OpenAI run
export async function createRun(thread: Thread, assistantId: string): Promise<Run> {

  console.log(`🚀 Creating run for thread ${thread.id} with assistant ${assistantId}`);

  let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
  });

  // Wait for the run to complete and keep polling
  while (run.status === 'in_progress' || run.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  return run;
}
// Create OpenAI thread
export async function createThread(message?: string): Promise<Thread> {
  const thread = await openai.beta.threads.create();

  if (message) {
      await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: message,
      });
  }

  return thread;
}

export async function handleOpenAIFunctionCall(toolName: string, args: any) {
  if (tools[toolName]) {
      return await tools[toolName].handler(args);
  } else {
      throw new Error(`Tool ${toolName} not found.`);
  }
}
