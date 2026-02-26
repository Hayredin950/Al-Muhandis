<div align="center">

<img src="artifacts/al-muhandis/public/logo.svg" alt="Al Muhandis Logo" height="180">

# 🚀 Al Muhandis
**AI-Powered Islamic Knowledge Platform for Quran, Hadith, and More**

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Hayredin950/Al-Muhandis/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Hayredin950/Al-Muhandis.svg)](https://github.com/Hayredin950/Al-Muhandis/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Hayredin950/Al-Muhandis.svg)](https://github.com/Hayredin950/Al-Muhandis/network/members)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

</div>

## ✨ Key Features

### 📖 Quran & Mushaf Experience
- **Beautiful Mushaf Interface**: Elegant, clean Quran reader
- **Tajweed Highlighting**: Proper color-coded tajweed rules
- **Multiple Translations**: Access to various Quran translations
- **Tafseer Integration**: Detailed tafseer of each verse
- **Hifz Tracker**: Memorization tracking and progress

### 📜 Hadith Exploration
- **Multiple Collections**: Access to major hadith collections
- **Grading System**: Hadith grading (sahih, hasan, da'if, etc.)
- **Isnad Visualization**: Beautiful isnad chain display
- **Weak Hadith Identification**: Flag weak hadiths with explanations
- **Topic-Based Search**: Find hadiths by specific topics

### 🤖 AI Scholar Assistant
- **Ask Scholar**: Ask questions about Islamic knowledge
- **Contextual Answers**: AI responses based on Quran and Hadith
- **Source Citations**: All answers reference authentic sources
- **Natural Language**: Ask questions in English or Arabic

### 📚 Knowledge Organization
- **Bookmarks**: Save your favorite verses and hadiths
- **Collections**: Create custom collections of content
- **Reading Goals**: Set and track your reading goals
- **Search & Analytics**: Powerful search and reading analytics
- **Profile**: Customize your personal Islamic learning profile

### 💻 Modern Stack
- **Type-Safe**: Full TypeScript implementation
- **API-First**: RESTful API with OpenAPI documentation
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Fast & Optimized**: Built with Vite and React

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend API** | Node.js, Express, TypeScript |
| **Database** | Drizzle ORM, PostgreSQL, SQLite |
| **AI Integration** | OpenAI API, LangChain |
| **Testing** | Vitest, Playwright |
| **Tools** | pnpm, ESLint, Prettier |
| **API Docs** | OpenAPI, Swagger UI |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL 15+ (optional, SQLite by default)

### Installation
```bash
# Clone the repository
git clone https://github.com/Hayredin950/Al-Muhandis.git
cd Al-Muhandis

# Install dependencies
pnpm install

# Start the API server
cd artifacts/api-server
pnpm install
pnpm dev

# In another terminal, start the frontend
cd artifacts/al-muhandis
pnpm install
pnpm dev

# Open your browser at http://localhost:5173
```

### Configuration
Create a `.env` file in the root:
```env
# OpenAI API for AI Scholar
OPENAI_API_KEY=your_openai_api_key

# Database (optional, default is SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/al_muhandis
```

## 📂 Project Structure
```
Al-Muhandis/
├── artifacts/
│   ├── al-muhandis/     # Main React frontend
│   ├── api-server/      # Backend API
│   └── mockup-sandbox/  # Design mockup tools
├── lib/                 # Shared libraries
│   ├── api-client-react/ # React API client
│   ├── api-spec/        # OpenAPI specification
│   ├── api-zod/         # Type-safe API schemas
│   ├── db/              # Database schema (Drizzle)
│   └── integrations-openai/ # OpenAI integration
├── scripts/             # Seed and utility scripts
└── ...
```

## 🌟 Highlights
- **Production-Ready**: Scalable architecture
- **Clean Code**: TypeScript and proper code organization
- **Open Source**: MIT-licensed
- **Beautiful UI**: Modern, elegant interface
- **Comprehensive Docs**: Well-documented for developers
- **AI-Powered**: Cutting-edge AI integration
- **Quran & Hadith**: Authentic Islamic knowledge resources

## 📄 License
MIT © [Hayredin950](https://github.com/Hayredin950)

## 📞 Contact
- GitHub: [Hayredin950](https://github.com/Hayredin950)
- Profile: [hayredin.vercel.app](https://hayredin.vercel.app/)

---

<div align="center">
Made with ❤️ for the Muslim Ummah by Hayredin950
</div>

<!-- Update for feat: add Quran reader foundation with beautiful UI -->

<!-- Update for feat: implement surah list and navigation -->

<!-- Update for fix: fix surah page styling and responsive issues -->

<!-- Update for refactor: organize frontend components -->

<!-- Update for docs: add initial project setup guide -->

<!-- Update for test: add basic test structure and configuration -->

<!-- Update for feat: add hadith collections explorer -->

<!-- Update for feat: implement hadith detail view with Arabic text -->

<!-- Update for fix: fix hadith text formatting and display -->

<!-- Update for refactor: optimize API response handling -->

<!-- Update for docs: update README with hadith features -->

<!-- Update for feat: implement bookmark system -->

<!-- Update for feat: add bookmark management UI -->

<!-- Update for fix: fix bookmark persistence issue -->

<!-- Update for refactor: improve state management with React hooks -->

<!-- Update for perf: optimize initial page load time -->

<!-- Update for feat: add hadith grading system -->

<!-- Update for feat: implement isnad chain display -->

<!-- Update for fix: fix hadith collection navigation -->

<!-- Update for refactor: refactor API routes -->

<!-- Update for docs: add API documentation -->

<!-- Update for test: add API endpoint tests -->

<!-- Update for feat: add AI scholar assistant -->

<!-- Update for feat: integrate OpenAI API for Q&A -->

<!-- Update for fix: fix AI response formatting -->

<!-- Update for refactor: improve prompt engineering -->

<!-- Update for docs: update AI features in README -->

<!-- Update for perf: optimize AI response time -->

<!-- Update for feat: add tajweed highlighting -->

<!-- Update for feat: implement Quran audio player -->

<!-- Update for fix: fix tajweed color mapping -->

<!-- Update for refactor: organize Quran reading components -->

<!-- Update for feat: add hifz tracker -->

<!-- Update for feat: implement reading goals -->

<!-- Update for fix: fix goal progress calculation -->

<!-- Update for refactor: improve profile page layout -->

<!-- Update for docs: add hifz tracker documentation -->

<!-- Update for feat: add search functionality -->

<!-- Update for feat: implement topic-based search -->

<!-- Update for fix: fix search result ranking -->

<!-- Update for refactor: optimize search queries -->

<!-- Update for perf: improve search performance -->

<!-- Update for feat: add collections feature -->

<!-- Update for feat: implement collection management -->

<!-- Update for fix: fix collection sharing issues -->

<!-- Update for refactor: improve data models -->

<!-- Update for docs: add collections guide -->

<!-- Update for test: add search and collections tests -->

<!-- Update for feat: add dark mode -->

<!-- Update for feat: implement user settings -->

<!-- Update for fix: fix dark mode persistence -->

<!-- Update for refactor: improve theme handling -->

<!-- Update for perf: optimize rendering performance -->

<!-- Update for feat: add reciters selection -->

<!-- Update for feat: implement Quran translation toggle -->

<!-- Update for fix: fix translation switching issues -->

<!-- Update for refactor: improve translation loading -->

<!-- Update for docs: add translation guide -->

<!-- Update for feat: add tafseer integration -->

<!-- Update for feat: implement tafseer display -->

<!-- Update for fix: fix tafseer navigation -->

<!-- Update for refactor: refactor tafseer data handling -->

<!-- Update for docs: add tafseer documentation -->

<!-- Update for feat: add analytics page -->

<!-- Update for feat: implement reading statistics -->

<!-- Update for fix: fix analytics data calculation -->

<!-- Update for refactor: improve analytics components -->

<!-- Update for perf: optimize analytics queries -->

<!-- Update for style: improve UI styling -->

<!-- Update for style: add beautiful gradients and colors -->

<!-- Update for style: fix responsive design issues -->

<!-- Update for refactor: improve accessibility -->

<!-- Update for docs: update full README with premium content -->

<!-- Update for fix: final bug fixes and polish before release -->

<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->
<!-- Update -->