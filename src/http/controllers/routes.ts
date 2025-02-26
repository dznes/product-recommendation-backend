import { openai } from "@/lib/openai";
import { tools } from "@/lib/tools";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

// Load Assistant ID from environment variables
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
if (!OPENAI_ASSISTANT_ID) {
  throw new Error("Missing API keys. Please set OPENAI_ASSISTANT_ID in your .env file.");
}

export async function AppRoutes(app: FastifyInstance) {
  app.post('/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { message, threadId } = request.body as { message: string; threadId?: string };

      if (!message) {
        return reply.status(400).send({ error: "Message is required" });
      }

      // If threadId exists, use it; otherwise, create a new thread
      let thread = threadId ? { id: threadId } : await createThread();

      // Send user message and handle assistant response
      const response = await sendMessageToThread(thread.id, message);

      return reply.send({ threadId: thread.id, response });
    } catch (error) {
      console.error("Chat error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}

// Create a new Thread
export async function createThread(): Promise<{ id: string }> {
  try {
    const thread = await openai.beta.threads.create();
    console.log("New thread created:", thread.id);
    return { id: thread.id };
  } catch (error) {
    console.error("Error creating thread:", error);
    throw new Error("Failed to create a thread");
  }
}

// Send a message to a Thread and process tool calls
export async function sendMessageToThread(threadId: string, message: string) {
  try {
    // Add user message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run assistant on the thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: OPENAI_ASSISTANT_ID ?? '',
    });

    // Wait for completion or tool calls
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== "completed" && runStatus.status !== "requires_action") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec before checking again
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // If tool calls are required, process them
    if (runStatus.status === "requires_action" && runStatus.required_action) {
      return await handleToolCalls(threadId, runStatus.required_action);
    }

    // Get the latest assistant message
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find(m => m.role === "assistant");

    return lastMessage ? lastMessage.content : "No response";
  } catch (error) {
    console.error("Error processing chat message:", error);
    throw new Error("Failed to process chat message");
  }
}

// Process OpenAI function calls
async function handleToolCalls(threadId: string, requiredAction: any) {
  console.log("Required Action:", JSON.stringify(requiredAction, null, 2));

  if (!requiredAction || !requiredAction.submit_tool_outputs) {
    console.error("Invalid tool call action:", requiredAction);
    throw new Error("Invalid tool call action.");
  }

  const toolCalls = requiredAction.submit_tool_outputs.tool_calls;
  if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
    throw new Error("No tool calls found.");
  }

  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    const { id: toolCallId, type, function: functionCall } = toolCall;

    if (type !== "function" || !functionCall) {
      console.error("Invalid function call format:", toolCall);
      continue;
    }

    const { name: functionName, arguments: args } = functionCall;
    console.log(`Processing function: ${functionName}`);

    if (!tools[functionName]) {
      console.error(`Tool ${functionName} not found. Available tools:`, Object.keys(tools));
      throw new Error(`Tool ${functionName} not found.`);
    }

    let parsedArgs;
    try {
      parsedArgs = JSON.parse(args);
    } catch (error) {
      console.error("Error parsing arguments:", args, error);
      throw new Error("Failed to parse function arguments.");
    }

    // Execute the corresponding tool function
    const toolResult = await tools[functionName].handler(parsedArgs);

    // Store tool result for submission
    toolOutputs.push({
      tool_call_id: toolCallId,
      output: JSON.stringify(toolResult),
    });
  }

  // Retrieve the latest run ID to submit outputs correctly
  const runStatus = await openai.beta.threads.runs.list(threadId);
  const latestRun = runStatus.data[0]; // Assuming latest run is the first one
  if (!latestRun) {
    throw new Error("No valid run found for tool submission.");
  }

  // Submit tool outputs back to OpenAI (Fixed API call)
  await openai.beta.threads.runs.submitToolOutputs(threadId, latestRun.id, {
    tool_outputs: toolOutputs,
  });

  // Wait for the assistant to process the tool output
  let updatedRunStatus = await openai.beta.threads.runs.retrieve(threadId, latestRun.id);
  while (updatedRunStatus.status !== "completed") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    updatedRunStatus = await openai.beta.threads.runs.retrieve(threadId, latestRun.id);
  }

  // Get final response after tool execution
  const messages = await openai.beta.threads.messages.list(threadId);
  const lastMessage = messages.data.find(m => m.role === "assistant");

  return lastMessage ? lastMessage.content : "No response after tool execution";
}
