import { NextRequest } from "next/server";
import { streamChatCompletion } from "../private/streamChatCompletion";
import { createChatJob } from "../private/createChatJob";
import {
  AIChatStreamConfig,
  AIChatStreamHandlers,
  ChatJobStore,
} from "../types";

/**
 * **Docs:** [GitHub Repository](https://github.com/ColeBlender/next-ai-stream)
 *
 * Creates Next.js API route handlers for streaming AI chat responses.
 *
 * This function generates `POST` and `GET` handlers:
 * - `POST` initializes a new chat job, storing conversation history.
 * - `GET` streams AI-generated chat responses back to the client.
 *
 * @example
 * ```typescript
 * // src/app/api/chat/route.ts
 *
 * import client from "@/ai";
 * import { createAIChatStreamRouteHandlers } from "next-ai-stream/server";
 *
 * export const dynamic = "force-dynamic";
 *
 * const { GET, POST } = createAIChatStreamRouteHandlers({
 *   client,
 *   model: "grok-2-latest",
 * });
 *
 * export { GET, POST };
 * ```
 *
 * @param {AIChatStreamConfig} props - Configuration for the API handlers.
 * @param {OpenAI} props.client - OpenAI client instance for API requests.
 * @param {string} props.model - AI model to use for chat completions.
 * @returns {AIChatStreamHandlers} - The API handlers for `POST` and `GET` requests.
 */
export function createAIChatStreamRouteHandlers({
  client,
  model,
}: AIChatStreamConfig): AIChatStreamHandlers {
  const jobs: ChatJobStore = {};

  return {
    async POST(request: NextRequest) {
      return createChatJob({ request, jobs });
    },
    async GET(request: NextRequest) {
      return streamChatCompletion({ request, jobs, client, model });
    },
  };
}
