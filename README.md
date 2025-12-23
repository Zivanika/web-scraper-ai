<h1 align="center">AI Web Scraper & Knowledge Extractor 🤖🕸️</h1> 

<p> AI Web Scraper is a modern, AI-powered web scraping platform that allows users to extract, analyze, and query information from websites intelligently. It combines traditional scraping techniques with Large Language Models to transform raw web data into meaningful, structured insights. </p>

[Visit Now]() 🚀

## 🖥️ Tech Stack

**Frontend:**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)&nbsp;
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)&nbsp;
![ShadCN](https://img.shields.io/badge/ShadCN-000000?style=for-the-badge&logo=radixui&logoColor=white)&nbsp;
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)&nbsp;

**Backend:**

![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)&nbsp;
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)&nbsp;
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)&nbsp;

**Queue Management:**

![BullMQ](https://img.shields.io/badge/BullMQ-FF6A00?style=for-the-badge&logo=bullmq&logoColor=white)&nbsp;

**Web Scraping:**

![Cheerio](https://img.shields.io/badge/Cheerio-FFC400?style=for-the-badge&logo=cheerio&logoColor=black)&nbsp;

**AI Integration:**

![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)&nbsp;

**Deployed On:**

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)&nbsp;
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)&nbsp;

---

## 📌 Key Features

<dl> <dt>🌐 Intelligent Web Scraping</dt> <dd>Scrapes website content using Cheerio and transforms raw HTML into clean, readable data.</dd> <dt>🤖 AI-Powered Analysis</dt> <dd>Uses OpenAI to summarize, answer questions, and extract insights from scraped content.</dd> <dt>⚙️ Background Job Processing</dt> <dd>Heavy scraping and AI tasks are handled asynchronously using BullMQ and Redis for reliability and scalability.</dd> <dt>📊 Task Tracking & Status Updates</dt> <dd>Each scrape request is tracked with real-time status updates, retries, and failure handling.</dd> <dt>💾 Persistent Storage</dt> <dd>All scraped data, AI responses, and task metadata are securely stored in PostgreSQL.</dd> <dt>🚀 Responsive & Modern UI</dt> <dd>Built with Next.js, Tailwind CSS, shadcn/ui, and TanStack Query for a fast and intuitive user experience.</dd> </dl>

## 📌 Screenshots:

![home](/img/home.png)

## 🚀 Getting Started:

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later) or [Yarn](https://yarnpkg.com/) (v1 or later)
- Redis instance (Upstash / Redis Cloud / local)
- PostgreSQL database

## 🏠 Running the Project Locally:

Follow these steps to run the project on your local machine:

### 1. Clone the Repository:

```sh
git clone https://github.com/Zivanika/web-scraper-ai.git
cd Web-Scrapper-Ai
```

### 2. Install Dependencies:

**Frontend dependencies:**

```sh
npm install
```

**Backend dependencies:**

```sh
cd backend
npm install
cd ..
```

### 3. Set Up Environment Variables:

**Frontend** - Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** - Create `.env` in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 4. Run the Backend Services:

You need to run **two separate processes** for the backend:

**Terminal 1 - Express API Server:**

```sh
cd backend
npm run dev:api
```

This will start the Express server on `http://localhost:5000`

**Terminal 2 - BullMQ Worker:**

```sh
cd backend
npm run dev:worker
```

This will start the worker process that handles scraping and AI processing jobs.

### 5. Run the Frontend:

**Terminal 3 - Next.js Frontend:**

```sh
npm run dev
```

### 6. Open Your Browser:

Open your browser and navigate to [http://localhost:3000](http://localhost:3000). You should see the application running!

**Note:** Make sure all three terminals are running:
- Terminal 1: Express API Server (port 5000)
- Terminal 2: BullMQ Worker
- Terminal 3: Next.js Frontend (port 3000)

## 📜 License:

This project is licensed under the MIT License.

<h2>📬 Contact</h2>

If you want to contact me, you can reach me through below handles.

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/harshita-barnwal-17a732234)

© 2025 Harshita Barnwal

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
