# Database Schema

This directory contains the Prisma schema and migrations for the Lisa reading assistant platform.

## Schema Overview

### Models

- **Story**: AI-generated stories cached for reuse
  - Reading level classification (BEGINNER to PROFICIENT)
  - Content, word count, theme
  - Associated questions and reading sessions

- **Question**: Comprehension questions for stories
  - Multiple types: multiple choice, true/false, short answer, vocabulary, inference, summarization
  - Difficulty levels and ordering
  - Explanations for learning

- **UserProgress**: Tracks user skill development
  - Reading level progression
  - Skill scores (comprehension, vocabulary, inference, summarization)
  - Streak tracking
  - Syncs with localStorage profiles

- **ReadingSession**: Individual story reading records
  - Tracks reading time and completion
  - Question performance metrics
  - Overall session score

- **Answer**: Individual question responses
  - User answers with correctness tracking
  - Time spent per question

## Common Commands

```bash
# Apply migrations to database
npx prisma migrate dev

# Generate Prisma Client after schema changes
npx prisma generate

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

## Usage in Code

```typescript
import prisma from '@/lib/prisma';

// Get stories by reading level
const stories = await prisma.story.findMany({
  where: { readingLevel: 'BEGINNER' },
  include: { questions: true }
});

// Create a reading session
const session = await prisma.readingSession.create({
  data: {
    userId: 'user-123',
    storyId: 'story-456',
    startedAt: new Date()
  }
});
```

## Database Connection

The database connection string is stored in `.env` and `.env.local` files and points to a Neon PostgreSQL database.
