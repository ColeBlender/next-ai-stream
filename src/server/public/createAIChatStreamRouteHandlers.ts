import { NextRequest } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { streamChatCompletion } from "../private/streamChatCompletion";
import { createChatJob } from "../private/createChatJob";

type Props = {
  client: OpenAI;
  model: string;
};

export function createAIChatStreamRouteHandlers({ client, model }: Props) {
  const jobs: { [key: string]: Array<ChatCompletionMessageParam> } = {};

  return {
    async POST(request: NextRequest) {
      return createChatJob({ request, jobs });
    },
    async GET(request: NextRequest) {
      return streamChatCompletion({ request, jobs, client, model });
    },
  };
}
