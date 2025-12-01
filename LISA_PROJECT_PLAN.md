# Lisa - AI-Powered Reading Assistant for Children

## Project Overview
Lisa is an AI-powered learning platform that helps children improve their reading comprehension and summarization skills through personalized story generation and adaptive questioning - similar to Duolingo but focused on reading literacy.

---

## Core Features
- **AI Story Generation**: Groq-powered stories tailored to reading level and interests
- **Adaptive Questions**: Comprehension, vocabulary, and summarization questions
- **Progress Tracking**: Skill assessment and automatic difficulty adjustment
- **Offline-First**: localStorage-based user data (no authentication required)
- **Child-Friendly UI**: Engaging, accessible interface with progress visualization

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Zustand** for state management
- **React Query** for data fetching

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **Neon PostgreSQL**
- **Groq AI API** for content generation

### Storage
- **localStorage** for user profiles and progress
- **PostgreSQL** for stories cache and content library

---

## Phase 1: Foundation & Core Reading Flow

### Goal
Create a working prototype where a user can:
1. Create/load their profile
2. Generate or select a story
3. Read through the story
4. Answer comprehension questions
5. See their progress and level up

### Todo List

#### ✅ Completed Tasks
1. **Initialize Next.js project with TypeScript & Tailwind** ✓

2. **Set up Prisma with Neon PostgreSQL** ✓

3. **Configure environment & dependencies** ✓

4. **Create localStorage user profile system** ✓

5. **Design and implement core UI layouts** ✓

6. **Build Groq AI story generation service** ✓
   - ✅ Created story-generator.ts service with age-appropriate prompt engineering
   - ✅ Implemented reading level guidance system (EARLY to FLUENT)
   - ✅ Built POST endpoint `/api/stories/generate` with validation
   - ✅ Built GET endpoint `/api/stories/generate?id=` to retrieve cached stories
   - ✅ Created GET endpoint `/api/stories/recent` for story library
   - ✅ Integrated automatic story caching in Prisma database
   - ✅ Added retry logic with exponential backoff for transient failures
   - ✅ Implemented rate limiting (10 requests/minute per IP)
   - ✅ Created custom error types (ValidationError, AIGenerationError, RateLimitError)
   - ✅ Built React hooks (useGenerateStory, useStory, useRecentStories)
   - ✅ Integrated story generation into stories page with modal dialog
   - ✅ Added LisaLoading component during generation
   - ✅ Connected story library to fetch and display real generated stories

7. **Build question generation system** ✓
   - ✅ Created question-generator.ts service with educational assessment expertise
   - ✅ Implemented multiple question types (multiple choice, true/false, fill-in-blank, sequencing)
   - ✅ Built skill-focused generation (comprehension, vocabulary, inference, summarization)
   - ✅ Added difficulty levels (EASY, MEDIUM, HARD)
   - ✅ Created POST endpoint `/api/questions/generate` with rate limiting
   - ✅ Created GET endpoint `/api/questions/generate?storyId=` to retrieve questions
   - ✅ Integrated automatic question caching in Prisma database
   - ✅ Built validateAnswer utility for answer checking
   - ✅ Created React hooks (useGenerateQuestions, useStoryQuestions)
   - ✅ Fully integrated reading session page with AI-generated stories and questions
   - ✅ Added loading states during story and question generation
   - ✅ Implemented complete 3-phase flow (reading → question generation → questions → results)

#### 🚧 In Progress
_None currently - all Phase 1 tasks complete!_

#### 📋 Todo

8. **Implement reading session flow** ✓ (COMPLETED - see task 7)
   - Complete user flow: select story → read → answer questions → see results → update progress
   - Include session state management

9. **Create progress tracking & leveling system**
   - Skill assessment algorithm based on performance
   - Track metrics: stories completed, accuracy rate, reading speed
   - Auto-adjust difficulty level and visualize progress

10. **Add story caching & optimization** ✓ (COMPLETED - see tasks 6 & 7)
    - Cache generated stories in localStorage and/or Prisma
    - Implement story library for quick access
    - Add loading states and optimistic UI updates

---

## Project Improvements & Considerations

### Data Persistence
- Export/import functionality for data backup
- Migration path to cloud storage for future
- Monitor localStorage size limits (~5-10MB)

### Content Strategy
- Age-appropriate content filtering
- Reading level taxonomy (Lexile scores, guided reading levels)
- Story templates and theme library
- Question types: comprehension, vocabulary, inference, summarization

### User Experience
- Progress visualization (streaks, badges, achievements)
- Text-to-speech for struggling readers
- Adjustable fonts and dyslexia-friendly options
- Parent dashboard to view progress

### Technical
- Groq AI rate limiting & error handling
- Story caching to reduce API costs
- Optional: Image generation for story illustrations
- Accessibility compliance (WCAG for children)

---

## Future Phases (Post-MVP)

### Phase 2: Enhanced Learning Experience
- Vocabulary builder with word definitions
- Reading speed tracking and improvement exercises
- Audio narration with highlighting
- Achievement system and gamification

### Phase 3: Content Library & Personalization
- Pre-generated story library by reading level
- Story collections by theme (adventure, science, history)
- Character customization in stories
- Favorite stories and bookmarks

### Phase 4: Social & Sharing
- Parent accounts (view child progress)
- Export progress reports
- Share completed stories
- Multi-profile support for siblings

---

## Getting Started

When ready to continue, simply message: **"Todos!"**

I will:
1. Read this plan
2. Check the todo list status
3. Continue with the next incomplete task
4. Update progress as we go

---

**Last Updated**: November 29, 2025
**Current Phase**: Phase 1 - Foundation
**Status**: Planning Complete ✓
