"use client";

import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { useState } from "react";

type Props = {
  apiEndpoint: string;
  systemPrompt: string;
};

export function useAIChatStream({ apiEndpoint, systemPrompt }: Props): {
  messages: ChatCompletionMessageParam[];
  submitNewMessage: (text: string) => Promise<void>;
  loading: boolean;
} {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content: systemPrompt,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const submitNewMessage = async (content: string) => {
    setLoading(true);

    const newMessage: ChatCompletionMessageParam = {
      role: "user",
      content,
    };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    const jobId = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
              {
                role: "assistant",
                content: data.content,
              },
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
