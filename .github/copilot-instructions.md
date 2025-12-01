# GitHub Copilot Instructions for Lisa

## Project Overview

Lisa is an AI-powered reading assistant for children built with Next.js 15, designed to improve reading comprehension through personalized story generation and adaptive questioning.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: Tailwind CSS v4, shadcn/ui, Framer Motion
- **State**: Zustand, TanStack React Query
- **Database**: Prisma ORM with Neon PostgreSQL
- **AI**: Groq API for content generation

## Project Structure

```
lisa-next/
├── prisma/schema.prisma     # Database schema (ReadingLevel, QuestionType enums)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── learn/           # Main reading experience
│   │   └── api/             # API routes (stories, questions)
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── lisa/            # Lisa companion (animated character)
│   ├── generated/prisma/    # Generated Prisma client
│   └── lib/
│       ├── constants.ts     # App configuration
│       └── utils/           # Utilities (error-handling, rate limiting)
```

## Code Style Guidelines

### TypeScript
- Use strict TypeScript with explicit types
- Prefer interfaces over type aliases for object shapes
- Use enums from Prisma schema: `ReadingLevel`, `QuestionType`
- Import types with `import type` when possible

### React Components
- Use functional components with `'use client'` directive for client components
- Prefer named exports for components
- Use Framer Motion for animations (`motion.div`, `AnimatePresence`)
- Follow component naming: PascalCase for components, camelCase for hooks

### File Naming
- Components: `kebab-case.tsx` (e.g., `lisa-companion.tsx`)
- Utilities: `kebab-case.ts` (e.g., `error-handling.ts`)
- Types: Define in component files or `types/` folder

### Styling
- Use Tailwind CSS classes exclusively (no inline styles)
- Color scheme: purple accents (`purple-400`, `purple-500`), gray neutrals
- Font weight: light (`font-light`) for readability
- Use `cn()` helper for conditional classes

### API Routes
- Use Next.js App Router API conventions (`route.ts`)
- Implement rate limiting for AI endpoints
- Return proper HTTP status codes
- Include error handling with custom error types

## Key Patterns

### Lisa Companion States
```typescript
type LisaState = 'idle' | 'thinking' | 'success' | 'celebration' | 
                 'struggle' | 'encouraging' | 'reading' | 'surprised';
```

### Reading Levels (from Prisma)
```typescript
enum ReadingLevel {
  BEGINNER      // Ages 5-6
  EARLY         // Ages 6-7
  DEVELOPING    // Ages 7-8
  INTERMEDIATE  // Ages 8-9
  ADVANCED      // Ages 9-10
  PROFICIENT    // Ages 10+
}
```

### Question Types
```typescript
enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  VOCABULARY
  INFERENCE
  SUMMARIZATION
}
```

## Component Examples

### Using Lisa Components
```tsx
import { LisaCompanion } from '@/components/lisa';
import { LisaLoading } from '@/components/lisa/lisa-loading';

// Animated companion
<LisaCompanion state="thinking" message={{ text: "..." }} />

// Loading state
<LisaLoading type="story" />
```

### Using shadcn/ui
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
```

### Animation Patterns
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {/* content */}
  </motion.div>
</AnimatePresence>
```

## Database Operations

### Prisma Client
```typescript
import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

// Query stories by reading level
const stories = await prisma.story.findMany({
  where: { readingLevel: 'BEGINNER' },
  include: { questions: true }
});
```

## Error Handling

Use custom error types from `lib/utils/error-handling.ts`:
- `RateLimitError` - For rate limiting
- `ValidationError` - For input validation
- `AIGenerationError` - For AI failures (with `retryable` flag)

## Important Notes

1. **Child-Friendly Content**: All generated content must be age-appropriate
2. **Accessibility**: Follow WCAG guidelines for children
3. **Performance**: Minimize animations on low-power devices
4. **Offline Support**: Use localStorage for user data persistence
5. **No Authentication**: Users identified by localStorage profile ID

## Common Tasks

### Adding a New Page
1. Create folder in `src/app/`
2. Add `page.tsx` with `'use client'` if needed
3. Use consistent layout patterns

### Adding a New Component
1. Create in `src/components/` (or subfolder)
2. Export from index file if in a group
3. Use Framer Motion for animations

### Adding API Endpoint
1. Create `route.ts` in `src/app/api/[endpoint]/`
2. Implement rate limiting for AI calls
3. Use proper validation and error handling

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Run `npx prisma generate`
