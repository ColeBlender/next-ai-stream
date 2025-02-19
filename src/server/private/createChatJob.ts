import { NextRequest } from "next/server";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { v4 as uuidv4 } from "uuid";

type CreateProps = {
  request: NextRequest;
  jobs: {
    [key: string]: Array<ChatCompletionMessageParam>;
  };
};

export async function createChatJob({ request, jobs }: CreateProps) {
  const { messages } = await request.json();

  if (!Array.isArray(messages)) {
    return new Response('"messages" must be an array passed in the body', {
      status: 400,
    });
  }

  const jobId = uuidv4();
  jobs[jobId] = messages;

  return Response.json(jobId);
}
