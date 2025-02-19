"use client";

import { useState } from "react";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { UseAIChatStreamProps, UseAIChatStreamReturn } from "../types";

/**
 * **Docs:** [GitHub Repository](https://github.com/ColeBlender/next-ai-stream)
 *
 * A React hook for streaming AI chat responses in real-time.
 *
 * This hook manages message state, sends user input to an AI model,
 * and handles Server-Sent Events (SSE) to stream responses.
 *
 * @example
 * ```tsx
 * // src/app/page.tsx
 *
 * "use client";
 *
 * import { useAIChatStream } from "next-ai-stream/client";
 *
 * const { messages, submitNewMessage, loading } = useAIChatStream({
 *   apiEndpoint: "/api/chat",
 *   systemPrompt: "You are an AI assistant.",
 * });
 * ```
 *
 * @param {UseAIChatStreamProps} props - Configuration for the chat stream.
 * @param {string} props.apiEndpoint - The API route for handling chat requests.
 * @param {string} props.systemPrompt - The initial system message for context.
 * @returns {UseAIChatStreamReturn} - The chat messages, a function to send messages, and a loading state.
 */
export function useAIChatStream({
  apiEndpoint,
  systemPrompt,
}: UseAIChatStreamProps): UseAIChatStreamReturn {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    { role: "system", content: systemPrompt },
  ]);
  const [loading, setLoading] = useState(false);

  const submitNewMessage = async (content: string) => {
    setLoading(true);

    const newMessage: ChatCompletionMessageParam = { role: "user", content };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    const jobId = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    }).then((res) => res.json());

    const eventSource = new EventSource(`${apiEndpoint}?jobId=${jobId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.content !== "[DONE]") {
        setMessages((prevMessages) => {
          if (prevMessages[prevMessages.length - 1].role === "assistant") {
            return [
              ...prevMessages.slice(0, prevMessages.length - 1),
              {
                role: "assistant",
                content:
                  prevMessages[prevMessages.length - 1].content + data.content,
              },
            ];
          } else {
            return [
              ...prevMessages,
              { role: "assistant", content: data.content },
            ];
          }
        });
      } else {
        eventSource?.close();
        setLoading(false);
      }

      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource?.close();
      setLoading(false);
    };
  };

  return { messages: messages.slice(1), submitNewMessage, loading };
}
