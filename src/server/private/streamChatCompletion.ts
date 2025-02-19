import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

export type StreamChatCompletionProps = {
  request: NextRequest;
  jobs: Record<string, ChatCompletionMessageParam[]>;
  client: OpenAI;
  model: string;
};

export async function streamChatCompletion({
  request,
  jobs,
  client,
  model,
}: StreamChatCompletionProps): Promise<NextResponse> {
  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return new NextResponse('"jobId" missing in searchParams', { status: 400 });
  }

  const messages = jobs[jobId];

  const chatStream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  delete jobs[jobId];

  const encoder = new TextEncoder();
  const ts = new TransformStream();
  const writer = ts.writable.getWriter();

  (async () => {
    try {
      for await (const chunk of chatStream) {
        const content = chunk.choices[0].delta.content;
        if (content) {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
        }
      }
      await writer.write(encoder.encode('data: {"content":"[DONE]"}\n\n'));
    } catch (error) {
      console.error("Error streaming events:", error);
    } finally {
      writer.close();
    }
  })();

  return new NextResponse(ts.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
