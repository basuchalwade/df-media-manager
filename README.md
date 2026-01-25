
# ContentCaster - AI Social Media Automation Studio

**ContentCaster** is a modern SaaS dashboard for managing social media campaigns, automated bots, and AI content creation.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

## 🧠 AI Configuration (Optional)

By default, the application runs in **Simulation Mode**. All AI responses (content generation, safety checks) are mocked for zero-cost testing.

To enable **Real AI** features using Google Gemini:

1. Create a file named `.env` in the root directory.
2. Add your API Key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Restart the server (`npm run dev`).

## 🏗️ Project Structure

*   `src/pages/CreatorStudio.tsx`: AI-powered content editor with mobile previews.
*   `src/pages/BotManager.tsx`: Configuration for autonomous agents.
*   `src/pages/Calendar.tsx`: Visual scheduling grid.
*   `src/services/mockStore.ts`: Local storage persistence layer (simulates backend).
*   `src/services/geminiService.ts`: AI logic handling simulation vs real API calls.

## 📦 Tech Stack

*   React 19
*   TypeScript
*   Vite
*   Tailwind CSS
*   Recharts
*   Google GenAI SDK
