
# ContentCaster - Enterprise AI Social Automation Platform

**ContentCaster** (by Dossiefoyer Private Limited) is the industry's most advanced social media command center. Unlike standard scheduling tools, ContentCaster employs **Autonomous AI Agents**, **Deep State Synchronization**, and **Context-Aware Scheduling** to manage high-volume social strategies with military precision.

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)
![AI](https://img.shields.io/badge/AI-Gemini%20Pro-purple)
![Docker](https://img.shields.io/badge/container-ready-blue)

---

## 🌟 Why ContentCaster? (Key Differentiators)

### 1. 🧠 Deep Sync™ Architecture
Most tools lose context when you switch between views. ContentCaster maintains a **Deep Sync** state.
- **Context Preservation**: Start editing in the Calendar, jump to the Creator Studio, and switch platforms without losing your draft, unsaved changes, or safety override settings.
- **Real-time State**: "Unsaved Changes" indicators track modifications across the entire session until committed to the database.

### 2. 📅 Intelligent Command Center (Calendar)
A calendar designed for power users and enterprise teams.
- **Drag-and-Drop Rescheduling**: Instantly drag posts from one day to another to reschedule. The system automatically preserves the original time slot while updating the date.
- **Visual Capacity Planning**: Smart indicators (e.g., "2/3") allow you to visualize daily load instantly.
  - **Orange Outline**: Day is full (at capacity).
  - **Red Pulse**: Day is over-booked. This acts as a signal for the **Bot Swarm** to halt auto-scheduling for that specific date.
- **Dynamic Bulk Operations**: Select multiple posts to trigger a "Dynamic Island" floating toolbar.
  - **Mass Reschedule**: Shift entire campaigns to specific dates.
  - **Quick +7 Days**: Instantly push content to the next week (perfect for delaying campaigns).
  - **Bulk Pause**: Revert scheduled posts to drafts in one click.
  - **Platform Migration**: Bulk convert Twitter posts to LinkedIn posts instantly.

### 3. 🤖 Context-Aware Bot Swarm
Our bots don't just post; they *think* before they act.
- **Calendar Awareness**: Bots scan your existing calendar load before creating drafts. If a day is marked as full (via the Capacity Indicator), the bot holds back to prevent spamming.
- **Blackout Dates**: Define holidays, launch days, or crisis periods where bots automatically silence themselves.
- **Granular Strategy**:
  - **Creator Bot**: Autonomous drafting based on brand voice (Professional, Viral, Empathetic).
  - **Engagement Bot**: Handles replies and likes with daily safety caps.
  - **Growth Bot**: Executes safe follow/unfollow strategies with cool-down periods.
- **Safety Throttling**: "Circuit breakers" stop bots immediately upon consecutive API errors or rate limits.

### 4. 🎨 Creator Studio Pro
- **A/B Testing (Variants)**: Generate and manage multiple text variants (Variant A, B, C) for a single post to test hooks.
- **Platform-Perfect Previews**: High-fidelity rendering for X (Twitter), Instagram (Grid & Carousel), LinkedIn, and YouTube.
- **AI Copilot**:
  - **Tone Shifting**: Rewrite content instantly (e.g., "Make it wittier", "Make it professional").
  - **Viral Hashtags**: Context-aware tag generation.
- **YouTube Workflow**: First-class support for Video Titles, Thumbnails, and Description formatting.

### 5. 🛡️ Trust & Safety Engine
An integrated AI layer that audits every keystroke before publication.
- **Compliance Checks**: Scans for hate speech, violence, NSFW content, and aggressive language.
- **Platform Policy**: Warns about character limits and aspect ratios (e.g., "Instagram images should be 1:1 or 4:5").
- **Safety Override**: Admins can explicitly bypass safety checks with audit logging.

---

## 🛠️ Installation & Local Development

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key (Paid Tier recommended for high volume)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/dossiefoyer/contentcaster.git
   cd contentcaster
   ```

2. **Configure Environment**
   Create a `.env` file:
   ```env
   API_KEY=your_gemini_api_key_here
   VITE_API_URL=http://localhost:8000
   ```

3. **Run Development Server**
   ```bash
   npm install
   npm run dev
   ```

---

## ☁️ Deployment & Self-Hosting

ContentCaster is designed to be deployed on your own infrastructure (AWS EC2, DigitalOcean Droplet, or on-premise servers) using Docker and Nginx.

### 1. Build & Run with Docker
We provide a production-ready `docker-compose.yml`.

```bash
# 1. Update your .env file with production keys
nano .env

# 2. Build and run the container in detached mode
docker compose up -d --build
```

### 2. Nginx Reverse Proxy Configuration
To serve the application securely on your own domain (e.g., `app.yourdomain.com`), configure Nginx as a reverse proxy.

**Create Nginx Config:**
```bash
sudo nano /etc/nginx/sites-available/contentcaster
```

**Paste the following configuration:**

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    # Frontend (React App)
    location / {
        proxy_pass http://localhost:3000; # Forward to Docker Container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (FastAPI/Node)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Enable the site and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/contentcaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ⚙️ Configuration & Troubleshooting

### Setting up Bots
1. Navigate to **Bot Manager**.
2. Select **Creator Bot** -> **Configure**.
3. **Calendar Tab**: Enable "Smart Scheduling" and set "Max Posts Per Day" to 3.
4. **Blackout Dates**: Add upcoming holidays to prevent auto-posting.
5. **Strategy Tab**: Set Creativity to "High" and Brand Voice to "Professional".

### Handling API Quotas (Error 429)
If you see a `Safety Check Error` or `429 Resource Exhausted`:
1. **Check Plan**: You are likely on the Gemini Free Tier which has rate limits. Upgrade to a Pay-as-you-go plan in Google AI Studio.
2. **Simulation Mode**: Go to **Settings** -> **Environment** and enable **Simulation Mode**. This uses internal mock engines instead of live API calls for testing purposes.

---

## 📱 Supported Platforms

| Platform | Type | Deep Features |
| :--- | :--- | :--- |
| **X (Twitter)** | Microblogging | • Thread visualization<br>• Reply automation<br>• Character count strict enforcement |
| **LinkedIn** | Professional | • Rich text formatting<br>• Corporate tone analysis |
| **Instagram** | Visual | • Carousel indicator support<br>• 1:1 / 4:5 Aspect Ratio validation |
| **YouTube** | Video | • **Video Title & Thumbnail Management**<br>• Description SEO optimization |

---

## 📝 License

**Dossiefoyer Private Limited**. Distributed under the MIT License.
