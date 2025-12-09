<div align="center">
  <h1>📚 Lisa</h1>
  <p><strong>AI-Powered Reading Companion for Young Learners</strong></p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>
<div align="center">
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/d9395e41-b2dc-42d2-aa38-61675a9dc859" />
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/17567d32-6425-4149-8a0d-bf5b69ac0b46" />
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/d9ba7c90-d237-4366-a192-6c69a38bd91c" />
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/8861c56b-eaed-46f9-a731-072d9f0d3f97" />
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/a67a2807-ad13-439e-8f2d-4f414ff51e62" />
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/2bfed80c-daac-4e44-9658-a75f93e7fe1f" />
<img width="377" height="667" alt="image" src="https://github.com/user-attachments/assets/33b2f734-89fb-4d35-b96a-51a9940a0cd5" />
<img width="371" height="669" alt="image" src="https://github.com/user-attachments/assets/67826770-4903-4e46-bfd4-e5e6a2a015a7" />
</div>

---

## 🌟 Overview

**Lisa** is an open-source, AI-powered learning platform designed to help children develop stronger reading comprehension skills through personalized, adaptive storytelling. Think of it as "Duolingo for reading literacy" – combining engaging narratives with intelligent assessment to create a natural, judgment-free learning experience.

### Why Lisa?

Reading comprehension is foundational to all learning, yet traditional approaches can feel dry or intimidating. Lisa creates a safe, engaging environment where:

- 📖 **Stories adapt** to each child's reading level and interests
- 🤖 **AI generates** fresh, personalized content on-demand
- 💡 **Questions flow naturally** into the reading experience
- 📈 **Progress tracking** guides adaptive difficulty
- 🎨 **Minimalist design** keeps focus on content, not distractions

## ✨ Features

### 🎯 Core Learning Experience

- **Adaptive Story Generation**: Leverages AI to create personalized stories based on reading level, themes, and interests
- **Progressive Reading Flow**: Paragraphs appear one at a time with smooth animations to maintain focus
- **Integrated Comprehension Questions**: Multiple choice, true/false, vocabulary, and inference questions woven naturally into stories
- **Contextual Vocabulary Hints**: Click underlined words for instant definitions and examples

### 📊 Progress & Personalization

- **6-Level Reading System**: From Beginner (ages 5-6) to Proficient (ages 10+)
- **Granular Skill Tracking**: Monitors comprehension, vocabulary, inference, and summarization
- **Adaptive Difficulty**: Automatically adjusts story complexity based on performance
- **Theme Customization**: Choose from preset themes or create custom ones
- **Offline-First Architecture**: No login required – progress stored locally for privacy

### 🎨 Design Philosophy

- **Distraction-Free Interface**: Clean, minimalist design inspired by Apple and Vercel
- **Child-Friendly UX**: Large touch targets, clear feedback, and encouraging language
- **Smooth Animations**: Framer Motion for polished, delightful interactions
- **Accessibility-First**: Built with semantic HTML and ARIA best practices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **Package Manager**: npm, yarn, or pnpm
- **Database**: PostgreSQL (local or [Neon](https://neon.tech) serverless)
- **API Key**: [Groq API](https://console.groq.com) for AI story generation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yelabb/lisa.git
   cd lisa/lisa-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database (Neon PostgreSQL recommended)
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   
   # Groq AI API Key (get yours at https://console.groq.com)
   GROQ_API_KEY="gsk_your_api_key_here"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

Lisa is optimized for deployment on **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yelabb/lisa)

Or manually:
```bash
npm run build
npm start
```

**Environment Variables for Production:**
- Set `DATABASE_URL` to your production PostgreSQL instance
- Set `GROQ_API_KEY` for AI content generation
- Optional: Configure `NODE_ENV=production`

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library with TypeScript |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | Animation library |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible component library |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [TanStack Query](https://tanstack.com/query) | Data fetching and caching |

### Backend
| Technology | Purpose |
|------------|---------|
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | Serverless API endpoints |
| [Prisma ORM](https://www.prisma.io/) | Type-safe database client |
| [Neon PostgreSQL](https://neon.tech/) | Serverless Postgres database |
| [Groq AI](https://groq.com/) | Fast LLM inference for content generation |

### Storage Architecture
- **localStorage**: User profiles, preferences, and progress (privacy-first)
- **PostgreSQL**: Story cache, content library, session history

## 📁 Project Structure

```
lisa-next/
├── prisma/
│   ├── schema.prisma           # Database schema with 5 models
│   └── migrations/             # Version-controlled migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stories/generate/   # AI story generation endpoint
│   │   │   ├── words/explain/      # Vocabulary definitions
│   │   │   └── progress/           # Progress tracking & sessions
│   │   ├── learn/                  # Main reading experience
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── lisa/                   # Lisa hints
│   │   ├── onboarding/             # Onboarding flow
│   │   ├── reading/                # Reading interface
│   │   └── settings/               # Settings dialog
│   ├── hooks/
│   │   ├── use-story.ts            # Story generation hooks
│   │   └── use-progress.ts         # Progress tracking hooks
│   ├── lib/
│   │   ├── db/                     # Database operations
│   │   ├── services/groq.ts        # Groq AI integration
│   │   └── utils/                  # Utility functions
│   ├── stores/
│   │   ├── user-progress.ts        # Progress state (localStorage)
│   │   ├── reading-settings.ts     # Reading preferences
│   │   └── reading-session.ts      # Active session state
│   └── types/                      # TypeScript definitions
└── public/                         # Static assets
```

## 🔌 API Reference

### Story Generation

**`POST /api/stories/generate`**

Generate a personalized story with comprehension questions.

```typescript
// Request
{
  "readingLevel": "DEVELOPING",
  "theme": "space-adventure",
  "interests": ["rockets", "planets"],
  "difficultyMultiplier": 1.0
}

// Response
{
  "story": {
    "id": "...",
    "title": "Journey to Mars",
    "content": "...",
    "paragraphs": [...],
    "wordCount": 450
  },
  "questions": [...],
  "cached": false
}
```

### Progress Tracking

**`GET /api/progress?userId={id}`**

Retrieve user progress and statistics.

**`PUT /api/progress`**

Update user preferences or onboarding status.

**`POST /api/progress/session`**

Record a completed reading session with answers.

### Vocabulary

**`POST /api/words/explain`**

Get definition and example for a vocabulary word.

## 🎓 Educational Features

### Reading Levels

Lisa uses a 6-tier reading level system aligned with common literacy frameworks:

| Level | Age Range | Grade | Characteristics |
|-------|-----------|-------|-----------------|
| **Beginner** | 5-6 | K-1st | Simple sentences, basic vocabulary |
| **Early** | 6-7 | 1st-2nd | Short paragraphs, sight words |
| **Developing** | 7-8 | 2nd-3rd | Longer stories, descriptive language |
| **Intermediate** | 8-9 | 3rd-4th | Complex plots, varied vocabulary |
| **Advanced** | 9-10 | 4th-5th | Nuanced themes, inference required |
| **Proficient** | 10+ | 5th+ | Abstract concepts, literary devices |

### Question Types

- **Multiple Choice**: Test comprehension and recall
- **True/False**: Quick fact verification
- **Vocabulary**: Context-based word understanding
- **Inference**: Reading between the lines
- **Summarization**: Main idea identification

### Skill Metrics

Lisa tracks four core reading skills (0-100 scale):

1. **Comprehension**: Understanding main ideas and details
2. **Vocabulary**: Word recognition and usage
3. **Inference**: Drawing conclusions from context
4. **Summarization**: Identifying key themes

## 🤝 Contributing

We welcome contributions from developers, educators, and designers! Lisa is built with the goal of improving children's literacy worldwide.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Areas for Contribution

- 🌍 **Internationalization**: Add support for more languages
- 🎨 **UI/UX**: Improve accessibility and child-friendliness
- 📚 **Content**: Pre-generate story libraries by theme
- 🧪 **Testing**: Add unit and integration tests
- 📖 **Documentation**: Improve guides and tutorials
- 🐛 **Bug Fixes**: Help squash issues

### Development Guidelines

- Follow the existing code style (TypeScript + ESLint)
- Write clear commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📊 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Next.js 15 + React 19 setup
- [x] Prisma ORM with PostgreSQL
- [x] Groq AI integration for story generation
- [x] Progressive reading interface
- [x] Adaptive progress tracking
- [x] Onboarding flow

### 🚧 Phase 2: Enhanced Learning (In Progress)
- [ ] Audio narration with text highlighting
- [ ] Reading speed tracking
- [ ] Expanded vocabulary builder
- [ ] Achievement system and badges
- [ ] Multi-language support (Spanish, French)

### 📅 Phase 3: Content Library (Planned)
- [ ] Pre-generated story library (1000+ stories)
- [ ] Story collections by theme and genre
- [ ] Custom story creation tools
- [ ] Favorites and bookmarking
- [ ] Offline mode for cached stories

### 🔮 Phase 4: Social Features (Future)
- [ ] Parent dashboard with insights
- [ ] Progress reports (PDF export)
- [ ] Multi-child profiles
- [ ] Teacher accounts with class management
- [ ] Community-contributed stories

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use Lisa commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Include in other projects

**Attribution appreciated but not required!**

## 🙏 Acknowledgments

- **Groq** for blazing-fast AI inference
- **Vercel** for seamless deployment
- **Neon** for serverless PostgreSQL
- **shadcn** for beautiful UI components
- The open-source community for inspiration and tools

## 💬 Support & Community

- **Issues**: [GitHub Issues](https://github.com/yelabb/lisa/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yelabb/lisa/discussions)
- **Email**: [Contact us](mailto:support@lisa-app.com)

---

<div align="center">
  <p>Built with ❤️ for children's literacy</p>
  <p>
    <a href="https://github.com/yelabb/lisa/stargazers">⭐ Star on GitHub</a> •
    <a href="https://github.com/yelabb/lisa/fork">🍴 Fork</a> •
    <a href="https://github.com/yelabb/lisa/issues/new">🐛 Report Bug</a>
  </p>
</div>


