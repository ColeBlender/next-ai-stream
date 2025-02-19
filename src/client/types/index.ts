import { ChatCompletionMessageParam } from "openai/src/resources/index.js";

export type UseAIChatStreamProps = {
  apiEndpoint: string;
  systemPrompt: string;
};

export type UseAIChatStreamReturn = {
  messages: ChatCompletionMessageParam[];
  submitNewMessage: (text: string) => Promise<void>;
  loading: boolean;
};
