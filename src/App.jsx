import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Markdown from "react-markdown";
import { model } from "./database/setup";
import "./example.css";

const App = () => {
  const [promptMessage, setpromptMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSend = async () => {
    if (!promptMessage.trim() || isLoading) return;

    const promptContext = `
    The user has submitted the message ${promptMessage}
    
    Your role is to provide examples of how to say the message shorter, more concise and effectively.

    Do not mention anything other that your examples, get straight to the point.
    
    `;

    const userMessage = { role: "user", content: promptMessage };
    setMessages((prev) => [...prev, userMessage]);
    setpromptMessage("");
    setIsLoading(true);

    try {
      const result = await model.generateContent(promptContext);
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
        <h3>Say Less.</h3>
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
            value={promptMessage}
            placeholder="Message"
            onChange={(event) => setpromptMessage(event.target.value)}
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
