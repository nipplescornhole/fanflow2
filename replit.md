# Overview

FanFlow is a social music platform that enables users to share audio and video content, discover new talent, and connect within a community of music enthusiasts, creators, and experts. The application features a modern React frontend with Express.js backend, supporting user authentication, media uploads, social interactions (likes, comments), and a multi-tier user system with listeners, creators, experts, and administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** for fast development and build tooling
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Shadcn/ui** components built on Radix UI primitives for consistent design
- **Tailwind CSS** with custom dark theme variables for styling
- Component-based architecture with clear separation of concerns

## Backend Architecture
- **Express.js** with TypeScript for the REST API server
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** with Neon serverless driver for data persistence
- **Multer** for handling file uploads (audio/video content)
- **Session-based authentication** using express-session with PostgreSQL store
- Modular route structure with middleware for authentication and error handling

## Database Design
- **Users table** supporting multi-tier user types (listener, creator, expert, admin)
- **Posts table** for audio/video content with metadata (title, description, genre, file URLs)
- **Comments table** for threaded discussions on posts
- **Likes table** for social engagement tracking
- **Sessions table** for authentication state management
- Schema designed with proper relationships and indexing for performance

## Authentication & Authorization
- **Replit Auth integration** using OpenID Connect for secure authentication
- **Role-based access control** with different permissions for user types
- **Expert verification system** with document upload and admin approval workflow
- **Session persistence** across browser sessions with secure cookie configuration

## Media Handling
- **File upload system** supporting audio (MP3, WAV) and video (MP4, MOV, AVI) formats
- **File size limits** and type validation for security
- **Cover image support** for audio content
- **Streaming-ready** media player components with custom controls

## State Management
- **Server state** managed through TanStack Query with intelligent caching
- **Client state** handled through React hooks and component state
- **Real-time updates** through query invalidation on mutations
- **Optimistic updates** for better user experience

## Security Features
- **Input validation** using Zod schemas for type safety
- **File type restrictions** and size limits for uploads
- **CSRF protection** through session-based authentication
- **SQL injection prevention** through parameterized queries with Drizzle ORM

# External Dependencies

## Database & Storage
- **Neon PostgreSQL** - Serverless PostgreSQL database for data persistence
- **File system storage** - Local file storage for uploaded media content

## Authentication
- **Replit Auth** - OpenID Connect provider for user authentication and authorization

## UI & Styling
- **Radix UI** - Accessible component primitives for the design system
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Icon library for consistent iconography

## Development & Build
- **Vite** - Modern build tool and development server
- **TypeScript** - Type safety across frontend and backend
- **ESBuild** - Fast JavaScript bundler for production builds

## Media Processing
- **Native HTML5** - Audio and video playback without external dependencies
- **Date-fns** - Date manipulation and formatting utilities

## Development Tools
- **Replit specific plugins** - Runtime error overlay, cartographer, and dev banner for Replit environment integration