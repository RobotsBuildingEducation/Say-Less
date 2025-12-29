import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "say-less-ai.firebaseapp.com",
  projectId: "say-less-ai",
  storageBucket: "say-less-ai.appspot.com",
  messagingSenderId: "532924917005",
  appId: "1:532924917005:web:897ed21df12c61ddd6fc44",
  measurementId: "G-QMM042N7JT",
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const vertexAI = getVertexAI(app);
export const model = getGenerativeModel(vertexAI, {
  model: "gemini-2.0-flash",
  generationConfig: {
    thinkingConfig: { thinkingBudget: 0 },
  },
});
