# Article Synthesis Application

## Overview

This is a comprehensive AI-powered article synthesis application that combines multiple news sources, APIs, and AI services to create intelligently synthesized content. The application uses a modern full-stack architecture with React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: React hooks with TanStack Query for server state
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **API Design**: RESTful endpoints with shared TypeScript types

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema**: Centralized schema in `shared/schema.ts`
- **Migrations**: Automated migrations with Drizzle Kit

## Key Components

### 1. Article Search and Aggregation
- **Multi-API Integration**: Comprehensive news source coverage with 15+ major outlets including:
  - **Primary Sources**: BBC, CNN, NPR, Guardian, Reuters, Associated Press
  - **Major Networks**: Fox News, MSNBC, CBS News, ABC News, NBC News
  - **Print Media**: New York Times, Washington Post, USA Today, Politico
  - **API Integration**: NewsAPI with 70+ sources when available
- **Location-Based Search**: Geolocation service for local news integration
- **Breaking News Detection**: AI-powered engagement metrics analysis
- **API Filtering**: User-customizable source selection with category-based filtering

### 2. AI Content Synthesis
- **Multiple AI Services**: Support for default AI and Manus AI integration
- **AI Article Generation**: ChatGPT automatically creates viral articles when real sources unavailable
- **Viral Content Focus**: AI generates trending, engaging articles optimized for sharing
- **Smart API Detection**: Automatically switches to real search when Google API keys provided
- **Real-time Generation**: Fast loading with background AI content enhancement
- **Style Adaptation**: 7 different writing styles (academic, journalistic, blog, technical, creative, business, opinion)
- **Advanced Editing**: Natural language processing for content refinement
- **Quality Analysis**: Comprehensive content quality metrics and improvement suggestions

### 3. Content Enhancement
- **Story Depth Meter**: AI-powered visual indicator showing article comprehensiveness with fact/perspective analysis
- **Perspective Compass**: Interactive compass visualization showing different viewpoints and bias analysis in articles
- **Image Generation**: AI-powered image creation with customizable styles and prompts
- **SEO Optimization**: Keyword extraction and metadata generation
- **Fact Checking**: Integration with fact-checking services
- **Title Recommendations**: AI-generated title suggestions with engagement scoring

### 4. User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Components**: Real-time search, drag-and-drop functionality
- **Dark Mode**: CSS variables for theme switching
- **Accessibility**: WCAG compliant with Radix UI primitives

## Data Flow

### 1. Content Ingestion
1. User searches for articles or manually inputs sources
2. System aggregates content from multiple APIs based on filters
3. Location service provides local news relevance
4. Breaking news detector prioritizes urgent content

### 2. Content Processing
1. AI service analyzes source articles for style recommendations
2. User selects writing style, tone, and length preferences
3. Content synthesis engine combines sources using selected AI service
4. Quality analysis evaluates and suggests improvements

### 3. Content Enhancement
1. Title recommendation system generates engaging headlines
2. Image generation creates relevant visuals
3. SEO optimization adds metadata and keywords
4. Fact-checking validates content accuracy

### 4. Content Management
1. Real-time editing with natural language instructions
2. Chat interface for iterative improvements
3. Publishing workflow with platform integration
4. Analytics and performance tracking

## External Dependencies

### APIs and Services
- **NewsAPI**: Primary news aggregation service
- **Google Custom Search**: Real-time web search integration
- **OpenAI API**: ChatGPT integration for content generation and editing
- **Manus AI**: Specialized content synthesis service
- **Neon Database**: PostgreSQL hosting with serverless scaling

### Third-Party Libraries
- **React Ecosystem**: React Query for data fetching, React Hook Form for form management
- **UI Components**: Radix UI primitives, Embla Carousel, Command palette
- **Utilities**: date-fns for date manipulation, clsx for conditional styling
- **Development**: Vite plugins for Replit integration and error handling

### Browser APIs
- **Geolocation API**: For location-based news filtering
- **Web Storage API**: For user preferences and session management
- **Fetch API**: For HTTP requests to external services

## Deployment Strategy

### Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development
- **Hot Module Replacement**: Fast development with Vite HMR
- **Error Handling**: Runtime error overlay for debugging
- **Environment Variables**: Secure API key management

### Production Build
- **Frontend**: Vite build with optimized bundle splitting
- **Backend**: esbuild compilation for Node.js deployment
- **Database**: Drizzle migrations for schema updates
- **Static Assets**: CDN-ready asset optimization

### Scalability Considerations
- **Database**: PostgreSQL with connection pooling
- **API Rate Limiting**: Intelligent request throttling
- **Caching**: Browser and server-side caching strategies
- **Error Recovery**: Graceful degradation with fallback content

### Security Measures
- **API Key Management**: Environment-based configuration
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Session Security**: Secure session management with PostgreSQL store

The application prioritizes user experience with intelligent content aggregation, AI-powered synthesis, and comprehensive editing tools while maintaining high performance and security standards.