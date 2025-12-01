# Lisa - AI-Powered Reading Assistant for Children

Lisa is an AI-powered learning platform that helps children improve their reading comprehension and summarization skills through personalized story generation and adaptive questioning — similar to Duolingo but focused on reading literacy.

## ✨ Philosophy

- **Single-Screen Experience** - Focused learning without distractions
- **Natural Reading Flow** - Stories unfold progressively with smooth animations
- **Integrated Questions** - Comprehension questions naturally woven into reading
- **Contextual Hints** - Word definitions on click, non-intrusive
- **No Judgment** - Background analysis, positive feedback only
- **Minimalist Design** - Clean Apple/Vercel-style interface

## 🎯 Core Features

- **AI Story Generation** - Groq-powered stories tailored to reading level and interests
- **Adaptive Questions** - Comprehension, vocabulary, inference, and summarization questions
- **Progress Tracking** - Skill assessment with automatic difficulty adjustment
- **Offline-First** - localStorage-based user data (no authentication required)
- **Child-Friendly UI** - Engaging, accessible interface with progress visualization
- **Lisa Companion** - Animated helper character with contextual hints and encouragement

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS v4**
- **Framer Motion** for smooth animations
- **shadcn/ui** components
- **Zustand** for state management
- **TanStack React Query** for data fetching

### Backend
- **Next.js API Routes**
- **Prisma ORM** with generated client
- **Neon PostgreSQL** (serverless)
- **Groq AI API** for content generation

### Storage
- **localStorage** for user profiles and progress
- **PostgreSQL** for stories cache and content library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn or npm
- PostgreSQL database (or Neon account)
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yelabb/lisa.git
cd lisa/lisa-next
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
DATABASE_URL="postgresql://..."
GROQ_API_KEY="gsk_..."
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
lisa-next/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── stories/   # Story generation endpoints
│   │   │   └── progress/  # Progress tracking endpoints
│   │   ├── learn/         # Main reading experience page
│   │   ├── layout.tsx     # Global layout with providers
│   │   ├── globals.css    # Global styles
│   │   └── page.tsx       # Home (redirects to /learn)
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── lisa/          # Lisa companion components
│   │   │   ├── lisa-companion.tsx  # Animated character
│   │   │   ├── lisa-hints.tsx      # Contextual hints system
│   │   │   └── lisa-loading.tsx    # Loading states
│   │   └── error-boundary.tsx
│   ├── generated/
│   │   └── prisma/        # Generated Prisma client
│   ├── hooks/             # React Query hooks
│   │   ├── use-story.ts   # Story generation hooks
│   │   └── use-progress.ts # Progress tracking hooks
│   ├── lib/
│   │   ├── constants.ts   # App constants and configuration
│   │   ├── utils.ts       # Utility functions
│   │   ├── db/            # Database utilities
│   │   │   ├── prisma.ts  # Prisma client singleton
│   │   │   ├── stories.ts # Story CRUD operations
│   │   │   └── progress.ts # Progress tracking
│   │   ├── services/      # External services
│   │   │   └── groq.ts    # Groq AI story/question generation
│   │   └── utils/
│   │       └── error-handling.ts  # Rate limiting and retry logic
│   ├── providers/         # React context providers
│   │   └── query-provider.tsx  # React Query provider
│   ├── stores/            # Zustand state stores
│   │   ├── user-progress.ts    # User progress with localStorage
│   │   └── reading-session.ts  # Current reading session
│   └── types/             # TypeScript types
│       └── index.ts       # Shared type definitions
└── public/                # Static assets
```

## 🔌 API Endpoints

### Story Generation
- `POST /api/stories/generate` - Generate a new AI story with questions
  - Body: `{ readingLevel, theme?, interests?, difficultyMultiplier? }`
  - Returns: `{ story, cached }`

### Progress Tracking
- `GET /api/progress?userId=xxx` - Get user progress
- `PUT /api/progress` - Update preferences or complete onboarding
- `POST /api/progress/session` - Track answers and session completion

## 🎯 Features In Detail

### 📖 Progressive Reading
- Paragraphs appear one at a time (5 seconds each)
- Smooth fade-in animations with Framer Motion
- Auto-progression with pause/play control
- Click on screen sides for manual navigation

### �� Vocabulary Hints
- Important words underlined with dotted border
- Click to reveal elegant tooltip with definition and example
- Non-intrusive, child-controlled

### ❓ Comprehension Questions
- Multiple question types: multiple choice, true/false, fill-in-blank, sequencing
- Skills assessed: comprehension, vocabulary, inference, summarization
- Difficulty levels: Easy, Medium, Hard
- Gentle explanations after each answer

### 🎨 Lisa Companion
- Animated character with multiple emotional states
- Contextual messages during onboarding, reading, and questions
- Encouraging feedback based on performance
- States: idle, thinking, success, celebration, struggle, encouraging, reading, surprised

### 📊 Progress System
- Six reading levels: Beginner → Early → Developing → Intermediate → Advanced → Proficient
- Granular scoring (0-100) within each level
- Skill tracking: comprehension, vocabulary, inference, summarization
- Adaptive difficulty multiplier (0.5x - 2.0x)
- Streak tracking and achievements

## 🎨 Design Principles

- **Clean White Background** - Zero visual noise
- **Light Typography** - font-weight: light for readability
- **Neutral Colors** - Soft grays with purple accents
- **Subtle Animations** - Framer Motion for polish
- **Generous Spacing** - Visual breathing room
- **Content Focus** - Nearly invisible interface

## 📝 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## 🗄️ Database Schema

Key models:
- **Story** - Cached AI-generated stories with reading level and theme
- **Question** - Comprehension questions linked to stories
- **UserProgress** - Tracks reading level, scores, and preferences
- **ReadingSession** - Session metrics and history
- **Answer** - User responses to questions

## 🚧 Roadmap

### Phase 1: Foundation (Current)
- [x] Next.js project setup
- [x] Prisma with Neon PostgreSQL
- [x] Core UI layouts and components
- [x] Lisa companion system
- [x] Groq AI story generation integration
- [x] Question generation system
- [x] Progress tracking and leveling

### Phase 2: Enhanced Learning
- [ ] Vocabulary builder with word definitions
- [ ] Reading speed tracking
- [ ] Audio narration with text highlighting
- [ ] Achievement system and gamification

### Phase 3: Content Library
- [ ] Pre-generated story library by level
- [ ] Story collections by theme
- [ ] Character customization
- [ ] Favorites and bookmarks

### Phase 4: Social Features
- [ ] Parent dashboard
- [ ] Progress reports export
- [ ] Multi-profile support

## 🤝 Contributing

Contributions are welcome! This is an educational project aimed at improving children's reading skills.

## 📄 License

Educational project.
