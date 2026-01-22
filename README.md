
# ContentCaster - Enterprise AI Social Automation Platform

**ContentCaster** (by Dossiefoyer Private Limited) is a production-ready, frontend-first social media command center. It leverages **Autonomous AI Agents**, **Deep State Synchronization**, and **Context-Aware Scheduling** to manage high-volume social strategies with military precision.

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![React](https://img.shields.io/badge/react-19.0-61DAFB.svg?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.0-3178C6.svg?logo=typescript&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini%20Flash%202.5-purple)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🏗️ Tech Stack

This application is built with a modern, performant, and type-safe stack designed for scalability.

### Core Framework
*   **React 19**: Utilizing the latest concurrent features and hooks.
*   **Vite**: Next-generation frontend tooling for instant HMR and optimized builds.
*   **TypeScript**: Strict type checking for robustness and maintainability.

### UI & Styling
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Lucide React**: consistent, lightweight icon library.
*   **Recharts**: Composable charting library for analytics visualization.
*   **Apple-System Fonts**: Native font stack integration for a premium OS-like feel.

### AI & Logic
*   **@google/genai**: Official SDK for Google's Gemini models (Flash 2.5 & Pro).
*   **Service Layer Pattern**: Decoupled business logic via `services/` directory.
*   **Deep Sync™ State**: Custom state management ensuring draft persistence across views.

---

## 📐 System Architecture

ContentCaster follows a **Service-Oriented Frontend Architecture (SOFA)**.

### 1. The Service Layer (`/services`)
Instead of embedding logic in components, all business logic lives in singleton services:
*   **`mockStore.ts`**: Acts as the "Backend-in-a-Box". It simulates database CRUD operations, API latency, and relational data integrity (Users <-> Posts <-> Bots). It is designed to be easily swapped with a real GraphQL/REST client.
*   **`geminiService.ts`**: Encapsulates all AI interaction. It handles prompt engineering, context injection (date, tone, platform constraints), and JSON schema enforcement.
*   **`validationService.ts`**: Centralized validation logic for platform-specific rules (e.g., Twitter 280 char limit, Instagram aspect ratios).

### 2. The Bot Swarm Engine
The application simulates autonomous agents using a State Machine pattern within `mockStore`:
*   **States**: `Idle` -> `Running` -> `Cooldown` -> `LimitReached` -> `Error`.
*   **Logic**: Bots respect global constraints (Calendar blackouts, Daily Action Limits) before executing.
*   **Simulation**: The `generateLogs` utility creates realistic audit trails for Creator, Engagement, Finder, and Growth bots.

### 3. Deep Sync™
A state preservation strategy where navigation parameters (passed via `onNavigate`) carry the full context of the user's intent.
*   *Example*: Clicking a date on the Calendar passes `{ date: '2024-10-10', timezone: 'EST' }` to the Creator Studio, ensuring the draft is pre-configured correctly.

---

## 📂 Project Structure

```bash
/
├── components/         # Reusable UI atoms (Buttons, Icons, Modals)
│   ├── MediaPicker.tsx # Unified asset selection & upload
│   ├── PlatformIcon.tsx# SVGs for X, LinkedIn, etc.
│   └── Sidebar.tsx     # Main navigation controller
├── pages/              # View Controllers (Screens)
│   ├── Analytics.tsx   # Data visualization dashboard
│   ├── BotManager.tsx  # Agent configuration & logs
│   ├── Calendar.tsx    # Drag-and-drop scheduling grid
│   ├── CreatorStudio.tsx # Main AI editor & previewer
│   └── ...
├── services/           # Business Logic & Data Access
│   ├── geminiService.ts # AI Prompt Engineering
│   ├── mockStore.ts    # Data persistence simulation
│   └── validationService.ts # Compliance rules
├── types.ts            # Shared TypeScript Interfaces (Domain Models)
├── App.tsx             # Main Router & Layout
└── index.tsx           # Entry Point
```

---

## 🚀 Key Features & Analysis

### 1. Creator Studio Pro (AI-Powered)
*   **Platform-Specific Optimization**: Uses `refinePostContent` with specific prompt instructions (e.g., "Make it punchy for X") to rewrite content in real-time.
*   **A/B Variant Generation**: Generates 3 distinct tonal variations (Viral, Professional, Question) using structured JSON output from Gemini.
*   **Live Mobile Previews**: Renders pixel-perfect mockups for X, Instagram, LinkedIn, and Google Business.

### 2. Intelligent Calendar
*   **Capacity Indicators**: Visual cues (Color-coded borders) indicate if a day is at optimal posting capacity or over-booked.
*   **Bulk Operations**: A "Dynamic Island" toolbar appears on selection, allowing mass rescheduling, approval, or deletion.
*   **Drag-and-Drop**: Implements HTML5 Drag and Drop API for intuitive rescheduling.

### 3. Bot Swarm Manager
*   **Granular Configuration**: Users can define specific "Work Hours", "Safety Levels", and "Topics" for each bot.
*   **Audit Logging**: Detailed logs (Info, Warning, Error) provide transparency into bot actions.
*   **Safety Throttling**: Simulated circuit breakers stop bots upon consecutive API errors.

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js v18+
*   NPM or Yarn
*   Google Gemini API Key (Get one from AI Studio)

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/dossiefoyer/contentcaster.git
    cd contentcaster
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    *   The app uses `process.env.API_KEY` for Gemini.
    *   Ensure your build tool injects this variable.

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

### Docker Deployment

A production-ready `docker-compose.yml` is included.

```bash
# Build and run container
docker-compose up -d --build
```

---

## ⚙️ Configuration

### API Keys
The application requires a valid API key for content generation.
1.  Go to `Settings` -> `Intelligence`.
2.  Enter your Gemini API Key.
3.  (Optional) Toggle "Simulation Mode" in `Settings` -> `Environment` to bypass live AI calls for testing.

### Adding New Platforms
To extend the app for a new platform (e.g., TikTok):
1.  Add entry to `Platform` enum in `types.ts`.
2.  Add icon to `PlatformIcon.tsx`.
3.  Add validation rules to `PLATFORM_LIMITS` in `validationService.ts`.
4.  Add preview rendering logic in `CreatorStudio.tsx`.

---

## 📝 License

**Dossiefoyer Private Limited**. Distributed under the MIT License.
