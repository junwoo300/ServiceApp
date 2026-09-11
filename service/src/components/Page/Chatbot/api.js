const API_URL = `${process.env.REACT_APP_API}/ask-ai`;

export async function askAI(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, language: "thai" }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}
