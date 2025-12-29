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

  // Quiz modal state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const generateQuiz = async () => {
    setQuizLoading(true);
    setShowQuizModal(true);
    setQuizSubmitted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    const conversationSummary = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const quizPrompt = `
    Based on this conversation about making messages more concise:

    ${conversationSummary}

    Generate a quiz with exactly 3 multiple choice questions to test if the user understands how to make statements more concise.

    Each question should test understanding of concise communication principles demonstrated in the conversation.

    Return ONLY valid JSON in this exact format (no markdown, no code blocks):
    {
      "summary": "A brief 2-3 sentence summary of the key conciseness lessons from this conversation",
      "questions": [
        {
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]
    }

    The correctAnswer should be the index (0-3) of the correct option.
    `;

    try {
      const result = await model.generateContent(quizPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      const quiz = JSON.parse(cleanedText);
      setQuizData(quiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setQuizData({
        summary: "Unable to generate quiz summary.",
        questions: [
          {
            question:
              "Sorry, there was an error generating the quiz. Please try again.",
            options: ["OK"],
            correctAnswer: 0,
          },
        ],
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const closeModal = () => {
    setShowQuizModal(false);
    setQuizData(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const getScore = () => {
    if (!quizData) return 0;
    let correct = 0;
    quizData.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) correct++;
    });
    return correct;
  };

  return (
    <>
      <div className="chat-wrapper">
        <h3>Say Less.</h3>
        <small>
          <b>
            An assistant to help you clarify and improve your business language.
          </b>
        </small>
        {messages.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={generateQuiz}
              disabled={isLoading || quizLoading}
            >
              Summarize Conversation
            </Button>
          </div>
        )}
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

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Summary Quiz</h4>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {quizLoading ? (
                <div className="quiz-loading">
                  <em>Generating quiz...</em>
                </div>
              ) : quizData ? (
                <>
                  <div className="quiz-summary">
                    <strong>Summary:</strong>
                    <p>{quizData.summary}</p>
                  </div>
                  {!quizSubmitted ? (
                    <>
                      <div className="quiz-progress">
                        Question {currentQuestionIndex + 1} of{" "}
                        {quizData.questions.length}
                      </div>
                      <div className="quiz-question">
                        <p className="question-text">
                          {quizData.questions[currentQuestionIndex].question}
                        </p>
                        <div className="options">
                          {quizData.questions[currentQuestionIndex].options.map(
                            (option, oIndex) => {
                              const isSelected =
                                userAnswers[currentQuestionIndex] === oIndex;
                              return (
                                <div
                                  key={oIndex}
                                  className={`option${
                                    isSelected ? " selected" : ""
                                  }`}
                                  onClick={() =>
                                    handleAnswerSelect(
                                      currentQuestionIndex,
                                      oIndex
                                    )
                                  }
                                >
                                  <span className="option-letter">
                                    {String.fromCharCode(65 + oIndex)}.
                                  </span>
                                  {option}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                      <div className="quiz-navigation">
                        {currentQuestionIndex <
                        quizData.questions.length - 1 ? (
                          <Button
                            variant="dark"
                            onClick={handleNextQuestion}
                            disabled={
                              userAnswers[currentQuestionIndex] === undefined
                            }
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            variant="dark"
                            onClick={handleSubmitQuiz}
                            disabled={
                              userAnswers[currentQuestionIndex] === undefined
                            }
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="quiz-results">
                      <p>
                        <strong>
                          Score: {getScore()} / {quizData.questions.length}
                        </strong>
                      </p>
                      <div className="quiz-answers-review">
                        {quizData.questions.map((q, qIndex) => (
                          <div key={qIndex} className="quiz-answer-item">
                            <p className="question-text">
                              <strong>{qIndex + 1}.</strong> {q.question}
                            </p>
                            <p
                              className={
                                userAnswers[qIndex] === q.correctAnswer
                                  ? "answer-correct"
                                  : "answer-incorrect"
                              }
                            >
                              Your answer: {q.options[userAnswers[qIndex]]}
                              {userAnswers[qIndex] !== q.correctAnswer && (
                                <span className="correct-answer">
                                  {" "}
                                  (Correct: {q.options[q.correctAnswer]})
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline-dark" onClick={closeModal}>
                        Close
                      </Button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
