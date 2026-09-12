import { apiFetch } from '../../../apiClient';
const API_URL = `${process.env.REACT_APP_API}/ask-ai`;

export async function askAI(prompt) {
  try {
    const response = await apiFetch(API_URL, {
      method: "POST",
      signal: AbortSignal.timeout(65000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, language: "thai" }),
    });

    const data = await response.json();
    if (!response.ok || typeof data.response !== 'string' || !data.response.trim()) {
      throw new Error('AI did not return a valid response');
    }
    return data.response;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}
