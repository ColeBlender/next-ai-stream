import { NextRequest } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";

export type AIChatStreamConfig = {
  client: OpenAI;
  model: string;
};

export type AIChatStreamHandlers = {
  POST: (request: NextRequest) => Promise<Response>;
  GET: (request: NextRequest) => Promise<Response>;
};

export type ChatJobStore = {
  [key: string]: Array<ChatCompletionMessageParam>;
};
