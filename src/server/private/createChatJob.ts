import { v4 as uuidv4 } from "uuid";
import { NextRequest } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources";

type CreateChatJobProps = {
  request: NextRequest;
  jobs: Record<string, ChatCompletionMessageParam[]>;
};

export async function createChatJob({
  request,
  jobs,
}: CreateChatJobProps): Promise<Response> {
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
