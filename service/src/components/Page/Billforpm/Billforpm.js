import React from "react";

const Billforpm = () => {
  const sendTestMessage = async () => {
    await fetch("https://api.telegram.org/bot7617997306:AAHegLMj-2wL-23exoHRnMcQS_5lrT-Xo-0/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "-4943849906",
        text: "สวัสดีจาก React! นะจ๊ะ อิอิ"
      })
    });
  };

  return (
    <div>
      <h2>ส่งข้อความไป Telegram</h2>
      <button onClick={sendTestMessage}>ส่งข้อความทดสอบ</button>
    </div>
  );
};

export default Billforpm;

