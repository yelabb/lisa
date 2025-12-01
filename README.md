# Lisa - Lecture Simplifiée

Lisa est une application de lecture minimaliste pour enfants, inspirée par le design épuré de Grammarly, Apple et Vercel.

## ✨ Philosophie

- **Un seul écran** - Expérience focalisée sans distraction
- **Lecture naturelle** - Les histoires se déroulent progressivement
- **Questions intégrées** - Posées naturellement dans le flux de lecture
- **Hints contextuels** - Définitions des mots au clic
- **Pas de jugement** - Analyse en arrière-plan, feedback positif uniquement
- **Design minimaliste** - Interface épurée, style Apple/Vercel

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** pour les animations fluides
- **Lucide React** pour les icônes minimalistes

## 🚀 Démarrage Rapide

### Installation

1. Cloner le dépôt:
```bash
git clone <repository-url>
cd lisa-next
```

2. Installer les dépendances:
```bash
yarn install
```

3. Lancer le serveur de développement:
```bash
yarn dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) pour voir l'application.

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
