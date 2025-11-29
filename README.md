# Lisa - AI-Powered Reading Assistant for Children

Lisa is an AI-powered learning platform that helps children improve their reading comprehension and summarization skills through personalized story generation and adaptive questioning.

## 🌟 Features

- **AI Story Generation**: Groq-powered stories tailored to reading level and interests
- **Adaptive Questions**: Comprehension, vocabulary, and summarization questions
- **Progress Tracking**: Skill assessment and automatic difficulty adjustment
- **Offline-First**: localStorage-based user data (no authentication required)
- **Child-Friendly UI**: Engaging, accessible interface with progress visualization

## 🛠️ Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** with Neon PostgreSQL
- **Groq AI API** for content generation
- **Zustand** for state management
- **React Query** for data fetching

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A Neon PostgreSQL database
- A Groq API key ([get one here](https://console.groq.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lisa-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
DATABASE_URL="your-neon-postgres-connection-string"
GROQ_API_KEY="your-groq-api-key"
NODE_ENV="development"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
lisa-next/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utility functions and configurations
│   │   ├── prisma.ts     # Prisma client singleton
│   │   ├── groq.ts       # Groq AI client
│   │   └── constants.ts  # App constants
│   ├── providers/        # React context providers
│   ├── types/            # TypeScript type definitions
│   └── generated/        # Generated Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🗄️ Database Schema

- **Story**: AI-generated stories with reading level classification
- **Question**: Comprehension questions with multiple types
- **UserProgress**: Tracks skill development and streaks
- **ReadingSession**: Individual reading records
- **Answer**: Question responses with correctness tracking

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## 🎯 Reading Levels

Lisa supports 6 reading levels:
- **Beginner** (Ages 5-6) - Kindergarten to 1st grade
- **Early Reader** (Ages 6-7) - 1st to 2nd grade
- **Developing** (Ages 7-8) - 2nd to 3rd grade
- **Intermediate** (Ages 8-9) - 3rd to 4th grade
- **Advanced** (Ages 9-10) - 4th to 5th grade
- **Proficient** (Ages 10+) - 5th grade and up

## 🎨 Story Themes

Adventure, Animals, Science, Friendship, Fantasy, Mystery, Space, Nature, Sports, Family

## 📝 Development Status

✅ Phase 1 - Foundation (In Progress)
- [x] Next.js project setup
- [x] Prisma & Neon PostgreSQL configuration
- [x] Environment & dependencies setup
- [ ] localStorage user profile system
- [ ] Core UI layouts with shadcn/ui
- [ ] Groq AI story generation service
- [ ] Question generation system
- [ ] Reading session flow
- [ ] Progress tracking & leveling
- [ ] Story caching & optimization

## 🤝 Contributing

This is a learning project. Contributions, issues, and feature requests are welcome!

## 📄 License

This project is for educational purposes.
