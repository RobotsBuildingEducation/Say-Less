import { useChatCompletion as useOpenAIChatCompletion } from "@aleph/openai-streaming-hooks";

const useChatCompletion = (config) => {
  return useOpenAIChatCompletion({
    model: "gpt-4o",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.9,
    ...config,
  });
};

export { useChatCompletion };
