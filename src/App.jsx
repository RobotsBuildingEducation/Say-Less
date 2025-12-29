import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Markdown from "react-markdown";
import { model } from "./database/setup";
import "./example.css";

const App = () => {
  const [promptText, setPromptText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSend = async () => {
    if (!promptText.trim() || isLoading) return;

    const userMessage = { role: "user", content: promptText };
    setMessages((prev) => [...prev, userMessage]);
    setPromptText("");
    setIsLoading(true);

    try {
      const result = await model.generateContent(promptText);
      const response = result.response;
      const text = response.text();

      const assistantMessage = { role: "assistant", content: text };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, there was an error generating a response.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  return (
    <>
      <div className="chat-wrapper">
        <h1>Say Less.</h1>
        <small>
          <b>
            An assistant to help you clarify and improve your business language.
          </b>
        </small>
        {messages.length < 1 ? (
          <div className="empty"></div>
        ) : (
          messages.map((msg, i) => (
            <div className="message-wrapper" key={i}>
              <div>
                {msg.role === "assistant" ? (
                  <div
                    style={{
                      backgroundColor: "#F0F0F0",
                      borderRadius: 24,
                      padding: 24,
                    }}
                  >
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <div>
                    <b>Message</b>
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message-wrapper">
            <div
              style={{
                backgroundColor: "#F0F0F0",
                borderRadius: 24,
                padding: 24,
              }}
            >
              <em>Thinking...</em>
            </div>
          </div>
        )}
      </div>
      <div className="prompt-wrapper">
        <div>
          <textarea
            value={promptText}
            placeholder="Message"
            onChange={(event) => setPromptText(event.target.value)}
            disabled={isLoading}
          />
          <Button variant="light" onMouseDown={onSend} disabled={isLoading}>
            &#8679;
          </Button>
        </div>
      </div>
    </>
  );
};

export default App;
