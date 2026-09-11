import { useState, useEffect, useRef } from "react";
import { askAI } from "./api";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInput("");

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: "กำลังพิมพ์...", sender: "typing" }
    ]);

    const aiResponse = await askAI(input);

    setMessages((prevMessages) => [
      ...prevMessages.filter((msg) => msg.sender !== "typing"),
      { text: aiResponse, sender: "ai" }
    ]);
  };

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="พิมพ์ข้อความ..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>ส่ง</button>
      </div>
    </div>
  );
}

export default Chat;
