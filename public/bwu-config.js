/* BWU frontend <-> backend settings.
 * API_BASE_URL: address of the FastAPI server deployed on Vercel (no trailing slash).
 *   Example: "https://bwu-backend.vercel.app"  -> requests go to {API_BASE_URL}/api/v1/...
 * CHAT_ENDPOINT: your own AI endpoint for the chatbot. It receives POST
 *   { message, history:[{role,content}] } and should reply JSON { reply: "..." }.
 */
window.BWU_CONFIG = window.BWU_CONFIG || {
  API_BASE_URL: "",
  API_PREFIX: "/api/v1",
  CHAT_ENDPOINT: "/api/chat",
};
